import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { StatCard } from "./StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { format } from "date-fns";

export function ParentDashboard() {
  const { data } = useQuery({ queryKey: ["leaves"], queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves") });
  const leaves = data?.leaves ?? [];
  const approved = leaves.filter((l) => l.status === "approved");
  const attendancePct = Math.max(0, 100 - approved.length * 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parent Overview</h1>
        <p className="text-sm text-muted-foreground">Stay updated on your child's leaves and attendance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total leaves" value={leaves.length} />
        <StatCard icon={Clock} label="Pending" value={leaves.filter((l) => l.status === "pending").length} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.length} tone="success" />
        <StatCard icon={CalendarCheck} label="Attendance" value={`${attendancePct}%`} tone="info" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
        <CardContent>
          {leaves.length === 0 ? <p className="text-sm text-muted-foreground">No leaves yet.</p> : (
            <ul className="divide-y">
              {leaves.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link to="/leaves/$id" params={{ id: l.id }} className="font-medium capitalize hover:underline">{l.category} leave</Link>
                    <div className="text-xs text-muted-foreground">{format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM yyyy")}</div>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
