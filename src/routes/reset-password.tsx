import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — SmartLeave AI" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset", { password });
      toast.success("Password updated. Please sign in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Choose a strong password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating..." : "Update password"}</Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
