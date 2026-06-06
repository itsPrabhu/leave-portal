import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/faculty/requests")({ component: RequestsPage });

function RequestsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["leaves"], queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves") });
  const leaves = data?.leaves ?? [];
  const [active, setActive] = useState<{ leave: LeaveRequest; action: "approve" | "reject" } | null>(null);
  const [remarks, setRemarks] = useState("");

  const act = useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: "approve" | "reject"; remarks: string }) =>
      api.post(`/leaves/${id}/${action}`, { remarks }),
    onSuccess: (_d, v) => {
      toast.success(`Leave ${v.action}d`);
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setActive(null);
      setRemarks("");
    },
  });

  const render = (rows: LeaveRequest[]) => (
    <Table>
      <TableHeader><TableRow>
        <TableHead>Student</TableHead><TableHead>Category</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">No requests.</TableCell></TableRow>
        ) : rows.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-medium">{l.studentName}<div className="text-xs text-muted-foreground">{l.department}</div></TableCell>
            <TableCell className="capitalize">{l.category}{l.emergency && <span className="ml-1 text-xs text-destructive">EMERG</span>}</TableCell>
            <TableCell className="text-sm">{format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM")}</TableCell>
            <TableCell><StatusBadge status={l.status} /></TableCell>
            <TableCell className="text-right">
              {l.status === "pending" ? (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setActive({ leave: l, action: "reject" }); setRemarks(""); }}>Reject</Button>
                  <Button size="sm" onClick={() => { setActive({ leave: l, action: "approve" }); setRemarks("Approved"); }}>Approve</Button>
                </div>
              ) : <span className="text-xs text-muted-foreground">{l.remarks ?? "—"}</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-sm text-muted-foreground">Approve or reject requests from your department.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">All requests</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({leaves.filter((l) => l.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">{render(leaves.filter((l) => l.status === "pending"))}</TabsContent>
            <TabsContent value="approved">{render(leaves.filter((l) => l.status === "approved"))}</TabsContent>
            <TabsContent value="rejected">{render(leaves.filter((l) => l.status === "rejected"))}</TabsContent>
            <TabsContent value="all">{render(leaves)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.action === "approve" ? "Approve leave" : "Reject leave"}</DialogTitle>
            <DialogDescription>{active && `${active.leave.studentName} · ${active.leave.category} leave`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={() => active && act.mutate({ id: active.leave.id, action: active.action, remarks })} disabled={act.isPending}>
              Confirm {active?.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
