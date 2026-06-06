import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;
  switch (user.role) {
    case "student": return <StudentDashboard />;
    case "faculty": return <FacultyDashboard />;
    case "parent": return <ParentDashboard />;
    case "admin": return <AdminDashboard />;
  }
}
