import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, PlusCircle, Bell, User, Settings, BarChart3, FileBarChart, Users, Building2, GraduationCap, Inbox } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";
import type { Role } from "@/types";

interface NavItem { title: string; url: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] }

export function AppSidebar() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (!user) return null;

  const items: NavItem[] = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard, roles: ["student", "faculty", "parent", "admin"] },
    { title: t.nav.leaves, url: "/leaves", icon: FileText, roles: ["student", "parent"] },
    { title: t.nav.apply, url: "/leaves/new", icon: PlusCircle, roles: ["student"] },
    { title: t.nav.requests, url: "/faculty/requests", icon: Inbox, roles: ["faculty"] },
    { title: t.nav.overview, url: "/parent/overview", icon: GraduationCap, roles: ["parent"] },
    { title: t.nav.analytics, url: "/analytics", icon: BarChart3, roles: ["faculty", "admin"] },
    { title: t.nav.reports, url: "/reports", icon: FileBarChart, roles: ["admin"] },
    { title: t.nav.users, url: "/admin/users", icon: Users, roles: ["admin"] },
    { title: t.nav.departments, url: "/admin/departments", icon: Building2, roles: ["admin"] },
    { title: t.nav.notifications, url: "/notifications", icon: Bell, roles: ["student", "faculty", "parent", "admin"] },
    { title: t.nav.profile, url: "/profile", icon: User, roles: ["student", "faculty", "parent", "admin"] },
    { title: t.nav.settings, url: "/settings", icon: Settings, roles: ["student", "faculty", "parent", "admin"] },
  ];

  const visible = items.filter((i) => i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">SL</div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">SmartLeave</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => {
                const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
