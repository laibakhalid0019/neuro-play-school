import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Breadcrumbs, Logo, PageBack } from "@/components/lumen";
import { LabelChip } from "@/components/lumen";
import { estimate, labelStatus, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports/$code")({
  head: () => ({
    meta: [
      { title: "Screening report — Lumen" },
      { name: "description", content: "Printable screening report for one student, identified by code." },
      { property: "og:title", content: "Screening report — Lumen" },
      { property: "og:description", content: "Printable screening report for one student, identified by code." },
    ],
  }),
  component: StudentReport,
});

function ageFrom(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const before = now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (before) years--;
  return `${years} years`;
}

function StudentReport() {
  const { user, hydrated, classes, students, sessions, labels } = useStore();
  const nav = useNavigate();
  const { code } = Route.useParams();

  useEffect(() => {
    if (hydrated && !user) nav({ to: "/login", replace: true });
  }, [hydrated, user, nav]);

  const student = students.find((s) => s.code === code);
  const list = useMemo(() =>
    sessions.filter((s) => s.studentCode === code).sort((a, b) => a.date.localeCompare(b.date)), [sessions, code]);
  const est = estimate(list);
  const label = student ? labelStatus(student.code, labels, sessions) : "";
  const cls = student ? classes.find((c) => c.id === student.classId) : undefined;
  const note = labels[code ?? ""]?.note;
  const generated = new Date().toISOString().slice(0, 10);

  if (!user || !student) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{hydrated ? "Report not found." : "Loading…"}</div>;
  }

  const pct = est ? Math.round(est.prob * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-[210mm] items-center gap-4 px-4 py-3">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <PageBack to="/reports" />
            <Button onClick={() => window.print()}>Print or save as PDF</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[210mm] px-4 py-8">
        <div className="no-print mb-4">
          <Breadcrumbs items={[{ label: "Reports", to: "/reports" }, { label: cls?.name ?? "" }, { label: code }]} />
        </div>
        <article className="print-sheet rounded-lg border bg-card p-8 md:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
            <div>
              <Logo />
              <h1 className="mt-4 text-2xl font-semibold text-foreground">Screening report</h1>
            </div>
            <dl className="text-sm text-muted-foreground">
              <div className="flex justify-end gap-2"><dt>Institution</dt><dd className="font-medium text-foreground">Riverside Primary School (sample)</dd></div>
              <div className="flex justify-end gap-2"><dt>Date generated</dt><dd className="font-medium text-foreground">{generated}</dd></div>
              <div className="flex justify-end gap-2"><dt>Teacher</dt><dd className="font-medium text-foreground">{user.name}</dd></div>
            </dl>
          </header>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">Student</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div><dt className="text-muted-foreground">Student code</dt><dd className="mt-0.5 font-medium">{student.code}</dd></div>
              <div><dt className="text-muted-foreground">Class</dt><dd className="mt-0.5 font-medium">{cls?.name ?? student.classId}</dd></div>
              <div><dt className="text-muted-foreground">Age</dt><dd className="mt-0.5 font-medium">{ageFrom(student.dob)}</dd></div>
              <div><dt className="text-muted-foreground">School year</dt><dd className="mt-0.5 font-medium">{student.year}</dd></div>
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            <div className="mt-3 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Teacher label</p>
                <p className="mt-1.5"><LabelChip status={label} /></p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Model screening estimate</p>
                {est ? (
                  <div className="mt-2">
                    <div className="h-3 w-full max-w-sm overflow-hidden rounded-sm bg-muted">
                      <div className={est.value === "Risk" ? "h-full bg-risk" : "h-full bg-success"} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-sm">{est.value} ({pct}%)</p>
                  </div>
                ) : <p className="mt-1.5 text-sm">No estimate yet.</p>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="mt-1.5 text-sm font-medium">{list.length}</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Recorded sessions</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-muted-foreground">
                  <tr>{["Date", "Length", "Accuracy", "Errors", "Response time"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2">{s.date}</td>
                      <td className="px-3 py-2">{s.minutes} min</td>
                      <td className="px-3 py-2">{s.accuracy}%</td>
                      <td className="px-3 py-2">{s.errors}</td>
                      <td className="px-3 py-2">{s.rtMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Trend across sessions</h2>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={list} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis yAxisId="acc" domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis yAxisId="rt" orientation="right" domain={[0, 1400]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} label={{ value: "Response time (ms)", angle: 90, position: "insideRight", fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="acc" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  <Line yAxisId="rt" type="monotone" dataKey="rtMs" name="Response time (ms)" stroke="var(--teal)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {note && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">Teacher note</h2>
              <p className="mt-2 text-sm text-muted-foreground">{note}</p>
            </section>
          )}

          <footer className="mt-10 border-t pt-4 text-sm text-muted-foreground">
            This report supports screening only. It is not a diagnosis. Share it with a qualified professional for any follow-up.
          </footer>
        </article>
      </main>
    </div>
  );
}
