import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { GraduationCap, ShieldCheck, Mic, BarChart3, Bell, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartLeave AI — Student Absence Management" },
      { name: "description", content: "Apply, approve, and track student leave with voice input, multi-language support, and real-time analytics." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">SL</div>
            <span className="font-semibold">SmartLeave AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Built for colleges
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Intelligent Student <span className="text-primary">Absence Management</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              SmartLeave AI brings students, faculty, parents, and admins onto one platform — with voice-assisted leave, document uploads, and real-time analytics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/register">Create account</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/login">Sign in</Link></Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo accounts: <code>student@demo.com</code> · <code>faculty@demo.com</code> · <code>parent@demo.com</code> · <code>admin@demo.com</code> — password <code>demo1234</code>
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Mic, label: "Voice-assisted leave" },
                { icon: ShieldCheck, label: "Role-based access" },
                { icon: BarChart3, label: "Live analytics" },
                { icon: Bell, label: "Smart notifications" },
                { icon: Globe, label: "EN + Tamil UI" },
                { icon: GraduationCap, label: "Academic recovery" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                  <Icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-4">
          {[
            { t: "Students", d: "Apply with voice, upload documents, track approvals, plan recovery." },
            { t: "Faculty", d: "Review and act on department requests with remarks." },
            { t: "Parents", d: "Stay informed about your child's attendance and approvals." },
            { t: "Admins", d: "Manage users, departments, and view system-wide analytics." },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border bg-card p-5">
              <div className="text-sm font-semibold">{x.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SmartLeave AI · Built with TanStack Start
        </div>
      </footer>
    </div>
  );
}
