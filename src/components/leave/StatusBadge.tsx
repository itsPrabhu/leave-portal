import type { LeaveStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, string> = {
    pending: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", map[status])}>
      {status}
    </span>
  );
}
