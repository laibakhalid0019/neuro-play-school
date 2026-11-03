import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { DEMO_USERS, INSTITUTION, useStore, type PlayStatus, type Readiness, type Role } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Lumen mark: rounded navy square, orbit ring, horizon line, sun dot. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--navy-deep)" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <path d="M6 21h20" stroke="#4fc3cd" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="15" r="3.4" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ size = "md", tone = "navy" }: { size?: "md" | "xl"; tone?: "navy" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark className={size === "xl" ? "h-16 w-16" : "h-7 w-7"} />
      <span className={cn("font-semibold", size === "xl" ? "text-4xl" : "text-lg", tone === "light" ? "text-white" : "text-foreground")}>
        Lumen
      </span>
    </span>
  );
}

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/classes", label: "Classes and Students" },
  { to: "/admin/data", label: "Data readiness" },
  { to: "/admin/federation", label: "Federation" },
] as const;
const STAFF_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/classes", label: "Classes" },
  { to: "/game-period", label: "Game period" },
  { to: "/review", label: "Review and label" },
  { to: "/reports", label: "Reports" },
] as const;

/** Destinations a "Back" text button may link to (typed routes). */
export type BackTarget = "/dashboard" | "/reports" | "/classes" | "/admin/classes" | "/play";
export type LinkTarget = BackTarget | "/admin" | "/review" | "/game-period" | "/login";

export function PageBack({ to, label = "Back" }: { to: BackTarget; label?: string }) {
  return (
    <Link to={to} className="inline-flex h-8 items-center rounded-md px-2 text-sm font-semibold text-teal hover:bg-muted">
      {label}
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: LinkTarget }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {item.to && i < items.length - 1 ? (
              <Link to={item.to} className="font-medium text-teal hover:underline">{item.label}</Link>
            ) : (
              <span className={i === items.length - 1 ? "font-medium text-foreground" : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppLayout({ area, children, title, actions, breadcrumbs }: {
  area: "admin" | "staff";
  children: ReactNode;
  title: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: LinkTarget }[];
}) {
  const { user, logout, hydrated } = useStore();
  const nav = useNavigate();
  const allowed = !!user && (area === "admin" ? user.role === "Admin" : user.role !== "Admin");
  useEffect(() => {
    if (!hydrated || allowed) return;
    if (!user) nav({ to: "/login", replace: true });
    else nav({ to: user.role === "Admin" ? "/admin" : "/dashboard", replace: true });
  }, [hydrated, allowed, user, nav]);
  if (!hydrated) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!allowed || !user) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Redirecting…</div>;
  const items = area === "admin" ? ADMIN_NAV : STAFF_NAV;
  const initials = user.name.replace(/^(Ms|Mr|Dr)\.\s*/, "").slice(0, 2).toUpperCase();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
          <Link to={area === "admin" ? "/admin" : "/dashboard"}><Logo /></Link>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
            {items.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-accent !text-teal font-semibold" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border bg-card px-3 py-1 font-medium">{INSTITUTION}</span>
            <span className="rounded-md bg-success-soft px-3 py-1 text-xs font-medium text-success">Lumen FL community, approved</span>
            <span className="rounded-md border bg-card px-3 py-1 font-medium">{user.role === "Admin" ? "Institution admin" : user.role}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground" title={user.name}>{initials}</span>
            <button onClick={() => { logout(); nav({ to: "/login", replace: true }); }} className="rounded-md px-2 py-1 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-24 md:px-6">
        {breadcrumbs && <div className="mb-3">{breadcrumbs.length > 1 ? <Breadcrumbs items={breadcrumbs} /> : null}</div>}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">{title}</h1>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

export function StatCard({ label, value, progress }: { label: string; value: ReactNode; progress?: number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {progress !== undefined && <Progress value={progress} className="mt-3 h-2" />}
    </Card>
  );
}

export function ClassToggle({ value, onChange, classes, includeAll = true }: { value: string; onChange: (v: string) => void; classes: { id: string; name: string }[]; includeAll?: boolean }) {
  const opts = [...(includeAll ? [{ id: "all", name: "All classes" }] : []), ...classes];
  return (
    <div role="radiogroup" aria-label="Class filter" className="inline-flex flex-wrap rounded-md border bg-card p-1">
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-sm px-3 py-1.5 text-sm transition-colors", value === o.id ? "bg-accent font-semibold text-teal" : "font-medium text-muted-foreground hover:text-foreground")}>{o.name}</button>
      ))}
    </div>
  );
}

export function LabelChip({ status }: { status: string }) {
  const cls =
    status === "Risk" ? "bg-risk-soft text-risk" :
    status === "No Risk" ? "bg-success-soft text-success" :
    status === "Not labelled" ? "bg-accent text-teal" : "bg-muted text-muted-foreground";
  return <span className={cn("inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium", cls)}>{status}</span>;
}

export function StatusChip({ status }: { status: PlayStatus }) {
  const cls = { Waiting: "bg-muted text-muted-foreground", Playing: "bg-accent text-teal", Paused: "bg-warning-soft text-warning", Finished: "bg-success-soft text-success" }[status];
  return <span className={cn("inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium", cls)}>{status}</span>;
}

export function ReadyChip({ status }: { status: Readiness }) {
  const cls = { "Ready for training": "bg-success-soft text-success", "In progress": "bg-warning-soft text-warning", "Not ready": "bg-risk-soft text-risk" }[status];
  return <span className={cn("inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium", cls)}>{status}</span>;
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "warning" | "risk" }) {
  const cls = { muted: "bg-muted text-muted-foreground", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", risk: "bg-risk-soft text-risk" }[tone];
  return <span className={cn("inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-semibold text-foreground">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NativeSelect({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn("h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring", className)} />;
}

export function StudentShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 pt-10 pb-28">{children}</div>;
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
    <div className="fixed right-4 bottom-4 z-[60] w-56 rounded-lg border bg-card">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-foreground">
        <span>Demo mode</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {open && (
        <div className="grid gap-1 border-t p-2">
          {([["Admin", "Admin view"], ["Teacher", "Teacher view"], ["Student", "Student lab screen"]] as const).map(([r, l]) => (
            <button key={r} onClick={() => go(r)} className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted">{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
