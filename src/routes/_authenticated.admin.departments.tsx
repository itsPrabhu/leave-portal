import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Department } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/departments")({ component: DeptPage });

function DeptPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["departments"], queryFn: () => api.get<{ departments: Department[] }>("/admin/departments") });
  const [form, setForm] = useState({ name: "", code: "", hod: "" });
  const create = useMutation({
    mutationFn: () => api.post("/admin/departments", form),
    onSuccess: () => { toast.success("Department added"); setForm({ name: "", code: "", hod: "" }); qc.invalidateQueries({ queryKey: ["departments"] }); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">Manage academic departments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">All departments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>HOD</TableHead></TableRow></TableHeader>
              <TableBody>
                {(data?.departments ?? []).map((d) => (
                  <TableRow key={d.id}><TableCell className="font-mono">{d.code}</TableCell><TableCell>{d.name}</TableCell><TableCell>{d.hod}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Add department</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
              <div className="space-y-1.5"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Head of Dept</Label><Input value={form.hod} onChange={(e) => setForm({ ...form, hod: e.target.value })} required /></div>
              <Button type="submit" className="w-full" disabled={create.isPending}>Add</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
