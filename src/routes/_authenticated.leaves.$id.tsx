import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LeaveRequest } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/leave/StatusBadge";
import { format } from "date-fns";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaves/$id")({ component: LeaveDetail });

function LeaveDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["leave", id],
    queryFn: () => api.get<{ leave: LeaveRequest }>(`/leaves/${id}`),
  });
  const l = data?.leave;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2"><Link to="/leaves"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !l ? <p>Not found.</p> : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold capitalize">{l.category} leave</h1>
              <p className="text-sm text-muted-foreground">Submitted {format(new Date(l.createdAt), "dd MMM yyyy, p")}</p>
            </div>
            <StatusBadge status={l.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Student" value={l.studentName} />
                <Field label="Department" value={l.department} />
                <Field label="From" value={format(new Date(l.fromDate), "dd MMM yyyy")} />
                <Field label="To" value={format(new Date(l.toDate), "dd MMM yyyy")} />
                {l.emergency && <Field label="Emergency" value="Yes" />}
                <Field label="Reason" value={l.reason} />
                {l.remarks && <Field label="Remarks" value={l.remarks} />}
                {l.facultyName && <Field label="Action by" value={l.facultyName} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
              <CardContent>
                {l.documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents attached.</p> : (
                  <ul className="space-y-2">
                    {l.documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{d.name}</span>
                        {d.verified && <span className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="h-3 w-3" /> Verified</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="col-span-2">{value}</div>
    </div>
  );
}
