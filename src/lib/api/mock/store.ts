import type { LeaveRequest, Notification, Department, User } from "@/types";
import { seedLeaves, seedNotifications, seedDepartments, seedUsers } from "./seed";

const KEY = "smartleave_mock_db_v1";

interface DB {
  users: (User & { password: string })[];
  leaves: LeaveRequest[];
  notifications: Notification[];
  departments: Department[];
}

function load(): DB {
  if (typeof window === "undefined") {
    return { users: seedUsers, leaves: seedLeaves, notifications: seedNotifications, departments: seedDepartments };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {}
  const db: DB = { users: seedUsers, leaves: seedLeaves, notifications: seedNotifications, departments: seedDepartments };
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

function save(db: DB) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(db));
}

let db: DB | null = null;
export function getDB(): DB {
  if (!db) db = load();
  return db;
}
export function commit() {
  if (db) save(db);
}
export function resetDB() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  db = null;
}
