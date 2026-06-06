import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LeaveCategory, LeaveDocument } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { VoiceInput } from "@/components/leave/VoiceInput";
import { DocumentUpload } from "@/components/leave/DocumentUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leaves/new")({ component: NewLeavePage });

function NewLeavePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    category: "personal" as LeaveCategory,
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
    emergency: false,
    documents: [] as LeaveDocument[],
  });

  const mutation = useMutation({
    mutationFn: () => api.post("/leaves", {
      ...form,
      fromDate: new Date(form.fromDate).toISOString(),
      toDate: new Date(form.toDate).toISOString(),
    }),
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      navigate({ to: "/leaves" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apply for Leave</h1>
        <p className="text-sm text-muted-foreground">Tell us why and when. Use voice input if you prefer.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as LeaveCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="sports">Sports participation</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Reason</Label>
                <VoiceInput onTranscript={(t) => setForm((f) => ({ ...f, reason: (f.reason ? f.reason + " " : "") + t }))} />
              </div>
              <Textarea rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="Describe the reason for your leave…" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3 md:col-span-2">
              <div>
                <Label htmlFor="emergency">Emergency leave</Label>
                <p className="text-xs text-muted-foreground">Mark this if it's urgent. Faculty will be notified immediately.</p>
              </div>
              <Switch id="emergency" checked={form.emergency} onCheckedChange={(v) => setForm({ ...form, emergency: v })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Supporting documents</Label>
              <DocumentUpload value={form.documents} onChange={(docs) => setForm({ ...form, documents: docs })} />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/leaves" })}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Submitting…" : "Submit request"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
