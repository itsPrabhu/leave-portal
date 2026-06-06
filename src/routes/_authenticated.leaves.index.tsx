import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaves/")({ component: LeavesList });

function LeavesList() {
  const { data, isLoading } = useQuery({ queryKey: ["leaves"], queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves") });
  const leaves = data?.leaves ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Leaves</h1>
          <p className="text-sm text-muted-foreground">All your leave requests in one place.</p>
        </div>
        <Button asChild><Link to="/leaves/new"><Plus className="h-4 w-4" /> Apply for leave</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="capitalize font-medium">{l.category}{l.emergency && <span className="ml-2 text-xs text-destructive">EMERGENCY</span>}</TableCell>
                    <TableCell>{format(new Date(l.fromDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>{format(new Date(l.toDate), "dd MMM yyyy")}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link to="/leaves/$id" params={{ id: l.id }}>View</Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
