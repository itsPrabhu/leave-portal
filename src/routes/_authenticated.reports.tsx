import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LeaveRequest, AnalyticsSummary } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/reports")({ component: ReportsPage });

function ReportsPage() {
  const { data: a } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get<{ summary: AnalyticsSummary }>("/analytics/summary") });
  const { data: l } = useQuery({ queryKey: ["leaves"], queryFn: () => api.get<{ leaves: LeaveRequest[] }>("/leaves") });
  const leaves = l?.leaves ?? [];
  const s = a?.summary;

  const exportCsv = () => {
    const rows = [
      ["ID", "Student", "Department", "Category", "From", "To", "Status", "Emergency", "Remarks"],
      ...leaves.map((x) => [x.id, x.studentName, x.department, x.category, x.fromDate, x.toDate, x.status, String(x.emergency), x.remarks ?? ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leaves-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Export leave data and view summaries.</p>
        </div>
        <Button onClick={exportCsv} className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">By department</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Department</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {(s?.byDepartment ?? []).map((d) => (
                  <TableRow key={d.department}><TableCell>{d.department}</TableCell><TableCell className="text-right">{d.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">By category</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {(s?.byCategory ?? []).map((d) => (
                  <TableRow key={d.category}><TableCell className="capitalize">{d.category}</TableCell><TableCell className="text-right">{d.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
