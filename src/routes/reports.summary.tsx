import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Breadcrumbs, Logo, PageBack } from "@/components/lumen";
import { LabelChip } from "@/components/lumen";
import { labelStatus, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/lumen";

export const Route = createFileRoute("/reports/summary")({
  head: () => ({
    meta: [
      { title: "Class summary — Lumen" },
      { name: "description", content: "Printable class summary of screening labels." },
      { property: "og:title", content: "Class summary — Lumen" },
      { property: "og:description", content: "Printable class summary of screening labels." },
    ],
  }),
  component: ClassSummary,
});

function ClassSummary() {
  const { user, hydrated, myClasses, students, sessions, labels } = useStore();
  const nav = useNavigate();
  const [sel, setSel] = useState("");
  const classId = myClasses.some((c) => c.id === sel) ? sel : myClasses[0]?.id ?? "";
  const cls = myClasses.find((c) => c.id === classId);
  const generated = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (hydrated && !user) nav({ to: "/login", replace: true });
  }, [hydrated, user, nav]);

  if (!user || !cls) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{hydrated ? "No class selected." : "Loading…"}</div>;
  }

  const roster = students.filter((s) => s.classId === classId);
  const played = roster.filter((s) => sessions.some((x) => x.studentCode === s.code));
  const risk = roster.filter((s) => labels[s.code]?.value === "risk").length;
  const noRisk = roster.filter((s) => labels[s.code]?.value === "norisk").length;
  const notLabelled = played.length - risk - noRisk;

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-[210mm] items-center gap-4 px-4 py-3">
          <Logo />
          <NativeSelect aria-label="Class" value={classId} onChange={(e) => setSel(e.target.value)} className="ml-4">
            {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
          <div className="ml-auto flex items-center gap-2">
            <PageBack to="/reports" />
            <Button onClick={() => window.print()}>Print or save as PDF</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[210mm] px-4 py-8">
        <div className="no-print mb-4">
          <Breadcrumbs items={[{ label: "Reports", to: "/reports" }, { label: "Class summary" }]} />
        </div>
        <article className="print-sheet rounded-lg border bg-card p-8 md:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
            <div>
              <Logo />
              <h1 className="mt-4 text-2xl font-semibold text-foreground">Class summary</h1>
            </div>
            <dl className="text-sm text-muted-foreground">
              <div className="flex justify-end gap-2"><dt>Institution</dt><dd className="font-medium text-foreground">Riverside Primary School (sample)</dd></div>
              <div className="flex justify-end gap-2"><dt>Date generated</dt><dd className="font-medium text-foreground">{generated}</dd></div>
              <div className="flex justify-end gap-2"><dt>Teacher</dt><dd className="font-medium text-foreground">{user.name}</dd></div>
            </dl>
          </header>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">{cls.name}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div><dt className="text-muted-foreground">Students played</dt><dd className="mt-0.5 font-medium">{played.length} of {roster.length} enrolled</dd></div>
              <div><dt className="text-muted-foreground">Risk</dt><dd className="mt-0.5 font-medium">{risk}</dd></div>
              <div><dt className="text-muted-foreground">No Risk</dt><dd className="mt-0.5 font-medium">{noRisk}</dd></div>
              <div><dt className="text-muted-foreground">Not labelled</dt><dd className="mt-0.5 font-medium">{Math.max(0, notLabelled)}</dd></div>
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Students</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-muted-foreground">
                  <tr>{["Student code", "Sessions played", "Label"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {roster.map((s) => {
                    const count = sessions.filter((x) => x.studentCode === s.code).length;
                    return (
                      <tr key={s.code}>
                        <td className="px-3 py-2 font-medium">{s.code}</td>
                        <td className="px-3 py-2">{count}</td>
                        <td className="px-3 py-2"><LabelChip status={labelStatus(s.code, labels, sessions)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-10 border-t pt-4 text-sm text-muted-foreground">
            This report supports screening only. It is not a diagnosis. Share it with a qualified professional for any follow-up.
          </footer>
        </article>
      </main>
    </div>
  );
}
