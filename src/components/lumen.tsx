import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { LogOut, Building2 } from "lucide-react";
import { useStore, type PlayStatus } from "@/lib/store";
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

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/classes", label: "Classes" },
  { to: "/game-period", label: "Game Period" },
  { to: "/review", label: "Review and Label" },
] as const;

export function StaffLayout({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const { user, logout } = useStore();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
          <Link to="/dashboard"><Logo /></Link>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-navy"
                activeProps={{ className: "bg-accent !text-navy" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-navy">
              <Building2 className="h-4 w-4" />{user?.institution ?? "Institution"}
            </span>
            <span className="rounded-full bg-amber/20 px-3 py-1 font-semibold text-navy">{user?.role ?? "Guest"}</span>
            <button onClick={() => { logout(); nav({ to: "/", replace: true }); }} className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-navy">
              <LogOut className="h-4 w-4" />Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">{title}</h1>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
        {children}
        <p className="mt-10 text-center text-xs text-muted-foreground">Sample data for design only · Lumen provides a screening estimate, not a diagnosis.</p>
      </main>
    </div>
  );
}

export function LabelChip({ status }: { status: string }) {
  const cls =
    status === "Risk" ? "bg-risk-soft text-risk" :
    status === "No Risk" ? "bg-success-soft text-success" :
    status === "Not labelled" ? "bg-accent text-primary" : "bg-muted text-muted-foreground";
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{status}</span>;
}

export function StatusChip({ status }: { status: PlayStatus }) {
  const cls = { Waiting: "bg-muted text-muted-foreground", Playing: "bg-accent text-primary", Paused: "bg-risk-soft text-risk", Finished: "bg-success-soft text-success" }[status];
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{status}</span>;
}

export function NativeSelect({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn("h-10 rounded-md border border-input bg-card px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring", className)} />;
}

export function StudentShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-10">{children}</div>;
}
