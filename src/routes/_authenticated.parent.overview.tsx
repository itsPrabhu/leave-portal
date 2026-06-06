import { createFileRoute } from "@tanstack/react-router";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";

export const Route = createFileRoute("/_authenticated/parent/overview")({ component: () => <ParentDashboard /> });
