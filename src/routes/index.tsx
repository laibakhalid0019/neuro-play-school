import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, LabelChip } from "@/components/lumen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Early screening support, built from play" },
      { name: "description", content: "Children play short games at school. Teachers review the results. Each school trains a shared model without ever sharing student data." },
      { property: "og:title", content: "Lumen — Early screening support, built from play" },
      { property: "og:description", content: "Children play short games at school. Teachers review the results. Each school trains a shared model without ever sharing student data." },
    ],
  }),
  component: LandingPage,
);

function TopBar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#privacy", label: "Privacy" },
    { href: "#for-schools", label: "For schools" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" aria-label="Lumen home"><Logo /></Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{l.label}</a>
          ))}
        </nav>
        <div className="ml-auto hidden md:block">
          <Button asChild><Link to="/login">Sign in</Link></Button>
        </div>
        <button className="ml-auto rounded-md border px-3 py-2 text-sm font-semibold md:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          Menu
        </button>
      </div>
      {open && (
        <div className="border-t px-4 py-3 md:hidden">
          <nav aria-label="Mobile" className="grid gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">{l.label}</a>
            ))}
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-teal hover:bg-muted" onClick={() => setOpen(false)}>Sign in</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/** Static, non-interactive mock of the teacher roster (codes only, no names). */
function HeroVisual() {
  const rows = [
    { code: "S-KG1-01", year: "2026/27", sessions: 3, label: "No Risk" },
    { code: "S-KG1-02", year: "2026/27", sessions: 2, label: "Risk" },
    { code: "S-KG1-03", year: "2026/27", sessions: 3, label: "Not labelled" },
    { code: "S-KG1-04", year: "2026/27", sessions: 1, label: "No Risk" },
    { code: "S-KG1-05", year: "2026/27", sessions: 0, label: "No sessions yet" },
  ];
  return (
    <Card className="w-full max-w-md overflow-x-auto p-0" aria-hidden>
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>{["Student code", "School year", "Sessions", "Label"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.code}>
              <td className="px-4 py-3 font-medium">{r.code}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.year}</td>
              <td className="px-4 py-3">{r.sessions}</td>
              <td className="px-4 py-3"><LabelChip status={r.label} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Line diagram: three schools send model weights to one global model. */
function PrivacyDiagram() {
  return (
    <svg viewBox="0 0 520 260" role="img" aria-label="Three schools send model weights to one global model" className="w-full max-w-md">
      <defs>
        <marker id="pd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--muted-foreground)" />
        </marker>
      </defs>
      {[40, 110, 180].map((y, i) => (
        <g key={y}>
          <rect x="16" y={y} width="130" height="44" rx="8" fill="var(--card)" stroke="var(--border)" />
          <text x="30" y={y + 26} fontSize="14" fill="var(--foreground)" fontFamily="inherit">School {i + 1}</text>
        </g>
      ))}
      {[62, 132, 202].map((y) => (
        <path key={y} d={`M150 ${y} C 240 ${y}, 260 130, 352 130`} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#pd-arrow)" />
      ))}
      <text x="200" y="40" fontSize="12" fill="var(--muted-foreground)" fontFamily="inherit">Model weights only</text>
      <rect x="356" y="102" width="148" height="56" rx="8" fill="var(--primary)" />
      <text x="372" y="126" fontSize="14" fill="#ffffff" fontFamily="inherit">Global model</text>
      <text x="372" y="145" fontSize="12" fill="#ffffff" opacity="0.8" fontFamily="inherit">Trained together</text>
    </svg>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Early screening support, built from play.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Children play short games at school. Teachers review the results. Each school trains a shared model without ever sharing student data.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild className="px-6"><Link to="/login">Sign in</Link></Button>
                <a href="#how-it-works" className="rounded-md px-2 py-2 text-sm font-semibold text-teal hover:underline">How it works</a>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end"><HeroVisual /></div>
          </div>
          <p className="mt-10 text-sm text-muted-foreground">Screening support, not a diagnosis.</p>
        </section>

        <section id="how-it-works" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <h2 className="text-2xl font-semibold text-foreground">How it works</h2>
            <div className="mt-8 grid gap-10 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Play</h3>
                <p className="mt-2 text-muted-foreground">Children play a short game on a lab PC. The school records accuracy, errors, session time and response time.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Review</h3>
                <p className="mt-2 text-muted-foreground">Teachers review each child's recorded sessions and add a Risk or No Risk label.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Learn together</h3>
                <p className="mt-2 text-muted-foreground">Schools train one shared model. Only model weights leave the school.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="border-t">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Privacy by design</h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-muted-foreground">
                <li>Student data stays on the school server.</li>
                <li>Only model weights are shared.</li>
                <li>Children are identified by code only.</li>
                <li>Unlabelled students are never used.</li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end"><PrivacyDiagram /></div>
          </div>
        </section>

        <section id="for-schools" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <h2 className="text-2xl font-semibold text-foreground">For schools</h2>
            <div className="mt-8 grid gap-10 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Admin</h3>
                <p className="mt-2 text-muted-foreground">Manages teachers, classes and students, checks data readiness and joins training rounds for the school.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Teacher</h3>
                <p className="mt-2 text-muted-foreground">Runs game periods in the lab, reviews recorded sessions and assigns labels from professional judgement.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Student</h3>
                <p className="mt-2 text-muted-foreground">Signs in on a lab PC with a class code and a student code. No account, and no results are shown to children.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-10 md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">A final year project prototype. Screening support, not a diagnosis.</p>
          <div className="ml-auto flex gap-4 text-sm font-medium">
            <a href="#privacy" className="text-teal hover:underline">Privacy</a>
            <Link to="/login" className="text-teal hover:underline">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
