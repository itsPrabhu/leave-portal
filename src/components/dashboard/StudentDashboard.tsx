import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { StatCard } from "./StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, XCircle, BookOpen, Plus } from "lucide-react";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth/context";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves"),
  });
  const leaves = data?.leaves ?? [];
  const pending = leaves.filter((l) => l.status === "pending").length;
  const approved = leaves.filter((l) => l.status === "approved").length;
  const rejected = leaves.filter((l) => l.status === "rejected").length;

  const missed = leaves.filter((l) => l.status === "approved").flatMap((l) => l.missedClasses ?? []);
  const assignments = leaves.filter((l) => l.status === "approved").flatMap((l) => l.assignments ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here's an overview of your leaves and academic recovery.</p>
        </div>
        <Button asChild><Link to="/leaves/new"><Plus className="h-4 w-4" /> Apply for leave</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total leaves" value={leaves.length} />
        <StatCard icon={Clock} label="Pending" value={pending} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} tone="success" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent leaves</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave requests yet. <Link to="/leaves/new" className="text-primary hover:underline">Apply for one</Link>.</p>
            ) : (
              <ul className="divide-y">
                {leaves.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link to="/leaves/$id" params={{ id: l.id }} className="font-medium capitalize hover:underline">{l.category} leave</Link>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM yyyy")}
                      </div>
                    </div>
                    <StatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Academic recovery</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Missed classes</div>
              {missed.length === 0 ? <p className="text-muted-foreground">None.</p> : (
                <ul className="mt-1 space-y-1">
                  {missed.slice(0, 4).map((m, i) => (
                    <li key={i} className="flex justify-between"><span>{m.subject}</span><span className="text-muted-foreground">{format(new Date(m.date), "dd MMM")}</span></li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Pending assignments</div>
              {assignments.length === 0 ? <p className="text-muted-foreground">None.</p> : (
                <ul className="mt-1 space-y-1">
                  {assignments.slice(0, 4).map((a, i) => (
                    <li key={i} className="flex justify-between"><span>{a.title}</span><span className="text-muted-foreground">due {format(new Date(a.dueDate), "dd MMM")}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
