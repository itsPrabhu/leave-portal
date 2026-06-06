import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Notification } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({ component: NotifPage });

const iconMap = {
  leave_submitted: { Icon: Bell, color: "text-info" },
  leave_approved: { Icon: CheckCircle2, color: "text-success" },
  leave_rejected: { Icon: XCircle, color: "text-destructive" },
  emergency: { Icon: AlertTriangle, color: "text-destructive" },
  info: { Icon: Info, color: "text-muted-foreground" },
};

function NotifPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => api.get<{ notifications: Notification[] }>("/notifications") });
  const mark = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const list = data?.notifications ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">All your notifications in one place.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent</CardTitle></CardHeader>
        <CardContent>
          {list.length === 0 ? <p className="text-sm text-muted-foreground">No notifications.</p> : (
            <ul className="divide-y">
              {list.map((n) => {
                const { Icon, color } = iconMap[n.type] ?? iconMap.info;
                return (
                  <li key={n.id} className={cn("flex items-start gap-3 py-3", !n.read && "bg-primary/5 -mx-6 px-6")}>
                    <div className={cn("mt-0.5", color)}><Icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-sm text-muted-foreground">{n.body}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                    </div>
                    {!n.read && <Button size="sm" variant="ghost" onClick={() => mark.mutate(n.id)}>Mark read</Button>}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
