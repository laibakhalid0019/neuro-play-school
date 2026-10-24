import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { LogOut, Building2, ShieldCheck, MonitorPlay, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { DEMO_USERS, INSTITUTION, useStore, type PlayStatus, type Readiness, type Role } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="7" className="fill-amber" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="15" y="1.5" width="2" height="5" rx="1" className="fill-amber" transform={`rotate(${i * 45} 16 16)`} />
      ))}
    </svg>
  );
}

export function Logo({ size = "md", tone = "navy" }: { size?: "md" | "xl"; tone?: "navy" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Sun className={size === "xl" ? "h-16 w-16" : "h-7 w-7"} />
      <span className={cn("font-extrabold tracking-[0.2em]", size === "xl" ? "text-5xl" : "text-xl", tone === "light" ? "text-navy-foreground" : "text-navy")}>LUMEN</span>
    </span>
  );
}

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/classes", label: "Classes and Students" },
  { to: "/admin/data", label: "Data Readiness" },
  { to: "/admin/federation", label: "Federation" },
] as const;
const STAFF_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/classes", label: "Classes" },
  { to: "/game-period", label: "Game Period" },
  { to: "/review", label: "Review and Label" },
] as const;

export function AppLayout({ area, children, title, actions, footer = true }: { area: "admin" | "staff"; children: ReactNode; title: string; actions?: ReactNode; footer?: boolean }) {
  const { user, logout } = useStore();
  const nav = useNavigate();
  const allowed = !!user && (area === "admin" ? user.role === "Admin" : user.role !== "Admin");
  useEffect(() => {
    if (allowed) return;
    if (!user) nav({ to: "/", replace: true });
    else nav({ to: user.role === "Admin" ? "/admin" : "/dashboard", replace: true });
  }, [allowed, user, nav]);
  if (!allowed || !user) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Redirecting…</div>;
  const items = area === "admin" ? ADMIN_NAV : STAFF_NAV;
  const initials = user.name.replace(/^(Ms|Mr|Dr)\.\s*/, "").slice(0, 2).toUpperCase();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
          <Link to={area === "admin" ? "/admin" : "/dashboard"}><Logo /></Link>
          <nav className="flex flex-wrap gap-1">
            {items.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-navy"
                activeProps={{ className: "bg-accent !text-navy" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-navy"><Building2 className="h-4 w-4" />{INSTITUTION}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success"><ShieldCheck className="h-3.5 w-3.5" />Lumen FL community · Approved</span>
            <span className="rounded-full bg-amber/20 px-3 py-1 font-semibold text-navy">{user.role === "Admin" ? "Institution Admin" : user.role}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground" title={user.name}>{initials}</span>
            <button onClick={() => { logout(); nav({ to: "/", replace: true }); }} className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-navy">
              <LogOut className="h-4 w-4" />Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">{title}</h1>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
        {children}
        {footer && <p className="mt-10 text-center text-xs text-muted-foreground">Sample data for design only · Screening estimate, not a diagnosis.</p>}
      </main>
    </div>
  );
}

export function StatCard({ label, value, progress }: { label: string; value: ReactNode; progress?: number }) {
  return (
    <Card className="p-5 shadow-soft">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-navy">{value}</p>
      {progress !== undefined && <Progress value={progress} className="mt-3 h-2" />}
    </Card>
  );
}

export function ClassToggle({ value, onChange, classes, includeAll = true }: { value: string; onChange: (v: string) => void; classes: { id: string; name: string }[]; includeAll?: boolean }) {
  const opts = [...(includeAll ? [{ id: "all", name: "All classes" }] : []), ...classes];
  return (
    <div role="radiogroup" aria-label="Class filter" className="inline-flex flex-wrap rounded-xl border bg-card p-1">
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-lg px-4 py-1.5 text-sm font-bold transition-colors", value === o.id ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-navy")}>{o.name}</button>
      ))}
    </div>
  );
}

export function LabelChip({ status }: { status: string }) {
  const cls =
    status === "Risk" ? "bg-risk-soft text-risk" :
    status === "No Risk" ? "bg-success-soft text-success" :
    status === "Not labelled" ? "bg-accent text-primary" : "bg-muted text-muted-foreground";
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{status}</span>;
}

export function StatusChip({ status }: { status: PlayStatus }) {
  const cls = { Waiting: "bg-muted text-muted-foreground", Playing: "bg-accent text-primary", Paused: "bg-amber/20 text-navy", Finished: "bg-success-soft text-success" }[status];
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{status}</span>;
}

export function ReadyChip({ status }: { status: Readiness }) {
  const cls = { "Ready for training": "bg-success-soft text-success", "In progress": "bg-amber/20 text-navy", "Not ready": "bg-risk-soft text-risk" }[status];
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{status}</span>;
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "amber" }) {
  const cls = { muted: "bg-muted text-muted-foreground", success: "bg-success-soft text-success", amber: "bg-amber/20 text-navy" }[tone];
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-bold text-navy">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NativeSelect({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn("h-10 rounded-md border border-input bg-card px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring", className)} />;
}

export function StudentShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-10">{children}</div>;
}

export function DemoMenu() {
  const { login } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const go = (role: Role | "Student") => {
    if (role === "Student") nav({ to: "/play" });
    else { login(DEMO_USERS[role]); nav({ to: role === "Admin" ? "/admin" : "/dashboard" }); }
    setOpen(false);
  };
  return (
    <div className="fixed bottom-4 left-4 z-50 w-56 rounded-xl border bg-card shadow-soft">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-bold text-navy">
        <span className="inline-flex items-center gap-2"><MonitorPlay className="h-4 w-4 text-amber" />Demo mode</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {open && (
        <div className="grid gap-1 border-t p-2">
          {([["Admin", "Admin view"], ["Teacher", "Teacher view"], ["Clinician", "Clinician view"], ["Student", "Student lab screen"]] as const).map(([r, l]) => (
            <button key={r} onClick={() => go(r)} className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-accent">{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
