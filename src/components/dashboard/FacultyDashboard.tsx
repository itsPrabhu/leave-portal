import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { StatCard } from "./StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { format } from "date-fns";
import { toast } from "sonner";

export function FacultyDashboard() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["leaves"], queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves") });
  const leaves = data?.leaves ?? [];
  const pending = leaves.filter((l) => l.status === "pending");

  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.post(`/leaves/${id}/${action}`, { remarks: action === "approve" ? "Approved" : "Rejected" }),
    onSuccess: (_d, v) => {
      toast.success(`Leave ${v.action}d`);
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-sm text-muted-foreground">Review and act on student leave requests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total in dept" value={leaves.length} />
        <StatCard icon={Clock} label="Pending" value={pending.length} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={leaves.filter((l) => l.status === "approved").length} tone="success" />
        <StatCard icon={XCircle} label="Rejected" value={leaves.filter((l) => l.status === "rejected").length} tone="destructive" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pending requests</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/faculty/requests">View all</Link></Button>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? <p className="text-sm text-muted-foreground">No pending requests.</p> : (
            <ul className="divide-y">
              {pending.slice(0, 6).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{l.studentName} <span className="text-xs text-muted-foreground capitalize">· {l.category}</span></div>
                    <div className="text-xs text-muted-foreground">{format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.status} />
                    <Button size="sm" variant="outline" onClick={() => act.mutate({ id: l.id, action: "reject" })}>Reject</Button>
                    <Button size="sm" onClick={() => act.mutate({ id: l.id, action: "approve" })}>Approve</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
