// Mock REST backend — simulates an Express + MySQL API. Persists to localStorage.
import type { User, LeaveRequest, Notification, AnalyticsSummary, Role } from "@/types";
import { getDB, commit } from "./store";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function token(userId: string) {
  return `mock.${btoa(userId)}.${Date.now()}`;
}
function decodeToken(t: string | null): string | null {
  if (!t || !t.startsWith("mock.")) return null;
  try { return atob(t.split(".")[1]); } catch { return null; }
}

function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("smartleave_token");
}
function currentUser(): User | null {
  const id = decodeToken(getAuthHeader());
  if (!id) return null;
  const u = getDB().users.find((x) => x.id === id);
  if (!u) return null;
  const { password: _p, ...safe } = u;
  return safe;
}

function notify(n: Omit<Notification, "id" | "createdAt" | "read">) {
  getDB().notifications.unshift({
    ...n,
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

function summarize(leaves: LeaveRequest[]): AnalyticsSummary {
  const byMonthMap = new Map<string, { approved: number; rejected: number; pending: number }>();
  const byDept = new Map<string, number>();
  const byCat = new Map<string, number>();
  const byDate = new Map<string, number>();
  for (const l of leaves) {
    const d = new Date(l.createdAt);
    const month = d.toLocaleString("en", { month: "short", year: "2-digit" });
    const m = byMonthMap.get(month) ?? { approved: 0, rejected: 0, pending: 0 };
    m[l.status] += 1;
    byMonthMap.set(month, m);
    byDept.set(l.department, (byDept.get(l.department) ?? 0) + 1);
    byCat.set(l.category, (byCat.get(l.category) ?? 0) + 1);
    const dk = d.toISOString().slice(0, 10);
    byDate.set(dk, (byDate.get(dk) ?? 0) + 1);
  }
  return {
    totalLeaves: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
    byMonth: Array.from(byMonthMap, ([month, v]) => ({ month, ...v })),
    byDepartment: Array.from(byDept, ([department, count]) => ({ department, count })),
    byCategory: Array.from(byCat, ([category, count]) => ({ category, count })),
    trend: Array.from(byDate, ([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

interface ReqOpts { method?: string; body?: unknown }

export async function mockApi<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  await delay();
  const method = opts.method ?? "GET";
  const body = opts.body as Record<string, unknown> | undefined;
  const db = getDB();

  // AUTH
  if (path === "/auth/login" && method === "POST") {
    const { email, password } = body as { email: string; password: string };
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) throw new Error("Invalid email or password");
    const { password: _p, ...safe } = u;
    return { token: token(u.id), user: safe } as T;
  }
  if (path === "/auth/register" && method === "POST") {
    const b = body as { name: string; email: string; password: string; role: Role; department?: string; rollNo?: string };
    if (db.users.some((x) => x.email.toLowerCase() === b.email.toLowerCase())) throw new Error("Email already registered");
    const u = { id: `u-${Date.now()}`, name: b.name, email: b.email, role: b.role, department: b.department, rollNo: b.rollNo, password: b.password };
    db.users.push(u);
    commit();
    const { password: _p, ...safe } = u;
    return { token: token(u.id), user: safe } as T;
  }
  if (path === "/auth/me") {
    const u = currentUser();
    if (!u) throw new Error("Unauthorized");
    return { user: u } as T;
  }
  if (path === "/auth/forgot" && method === "POST") {
    return { ok: true, message: "If the email exists, a reset link was sent." } as T;
  }
  if (path === "/auth/reset" && method === "POST") {
    return { ok: true } as T;
  }

  const me = currentUser();

  // LEAVES
  if (path === "/leaves" && method === "GET") {
    if (!me) throw new Error("Unauthorized");
    let list = db.leaves;
    if (me.role === "student") list = list.filter((l) => l.studentId === me.id);
    else if (me.role === "parent" && me.childId) list = list.filter((l) => l.studentId === me.childId);
    // faculty + admin see all (faculty filtered to department on UI)
    if (me.role === "faculty" && me.department) list = list.filter((l) => l.department === me.department);
    return { leaves: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) } as T;
  }
  if (path === "/leaves" && method === "POST") {
    if (!me) throw new Error("Unauthorized");
    const b = body as Partial<LeaveRequest>;
    const leave: LeaveRequest = {
      id: `l-${Date.now()}`,
      studentId: me.id,
      studentName: me.name,
      department: me.department ?? "CSE",
      category: b.category ?? "personal",
      fromDate: b.fromDate!,
      toDate: b.toDate!,
      reason: b.reason ?? "",
      emergency: !!b.emergency,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: b.documents ?? [],
    };
    db.leaves.unshift(leave);
    notify({ userId: "u-faculty", title: leave.emergency ? "Emergency leave request" : "New leave request", body: `${me.name} requested ${leave.category} leave.`, type: leave.emergency ? "emergency" : "leave_submitted", link: "/faculty/requests" });
    commit();
    return { leave } as T;
  }
  const leaveIdMatch = path.match(/^\/leaves\/([^/]+)$/);
  if (leaveIdMatch && method === "GET") {
    const l = db.leaves.find((x) => x.id === leaveIdMatch[1]);
    if (!l) throw new Error("Leave not found");
    return { leave: l } as T;
  }
  const actionMatch = path.match(/^\/leaves\/([^/]+)\/(approve|reject)$/);
  if (actionMatch && method === "POST") {
    if (!me || (me.role !== "faculty" && me.role !== "admin")) throw new Error("Forbidden");
    const l = db.leaves.find((x) => x.id === actionMatch[1]);
    if (!l) throw new Error("Leave not found");
    l.status = actionMatch[2] === "approve" ? "approved" : "rejected";
    l.remarks = (body as { remarks?: string })?.remarks ?? l.remarks;
    l.facultyId = me.id;
    l.facultyName = me.name;
    l.updatedAt = new Date().toISOString();
    notify({ userId: l.studentId, title: `Leave ${l.status}`, body: `Your ${l.category} leave was ${l.status}.`, type: l.status === "approved" ? "leave_approved" : "leave_rejected", link: `/leaves/${l.id}` });
    commit();
    return { leave: l } as T;
  }

  // NOTIFICATIONS
  if (path === "/notifications" && method === "GET") {
    if (!me) throw new Error("Unauthorized");
    const list = db.notifications.filter((n) => n.userId === me.id);
    return { notifications: list } as T;
  }
  if (path.startsWith("/notifications/") && path.endsWith("/read") && method === "POST") {
    const id = path.split("/")[2];
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    commit();
    return { ok: true } as T;
  }

  // ANALYTICS
  if (path === "/analytics/summary" && method === "GET") {
    return { summary: summarize(db.leaves) } as T;
  }

  // ADMIN — users
  if (path === "/admin/users" && method === "GET") {
    return { users: db.users.map(({ password: _p, ...u }) => u) } as T;
  }
  const userIdMatch = path.match(/^\/admin\/users\/([^/]+)$/);
  if (userIdMatch && method === "DELETE") {
    db.users = db.users.filter((u) => u.id !== userIdMatch[1]);
    commit();
    return { ok: true } as T;
  }

  // DEPARTMENTS
  if (path === "/admin/departments" && method === "GET") return { departments: db.departments } as T;
  if (path === "/admin/departments" && method === "POST") {
    const b = body as { name: string; code: string; hod: string };
    const d = { id: `d-${Date.now()}`, ...b };
    db.departments.push(d);
    commit();
    return { department: d } as T;
  }

  // PROFILE
  if (path === "/profile" && method === "PATCH") {
    if (!me) throw new Error("Unauthorized");
    const u = db.users.find((x) => x.id === me.id);
    if (u) Object.assign(u, body);
    commit();
    const { password: _p, ...safe } = u!;
    return { user: safe } as T;
  }

  throw new Error(`Mock API: route not implemented — ${method} ${path}`);
}
