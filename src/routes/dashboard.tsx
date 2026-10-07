import { createFileRoute, Link } from "@tanstack/react-router";
import { StaffLayout } from "@/components/lumen";
import { CLASSES, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumen" },
      { name: "description", content: "Overview of classes, sessions and labelling progress." },
      { property: "og:title", content: "Dashboard — Lumen" },
      { property: "og:description", content: "Overview of classes, sessions and labelling progress." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { students, sessions, labels } = useStore();
  const labelled = sessions.filter((s) => labels[s.studentCode]).length;
  const toLabel = sessions.length - labelled;
  const stats = [
    { k: "Classes", v: CLASSES.length },
    { k: "Students", v: students.length },
    { k: "Sessions played", v: sessions.length },
  ];
  return (
    <StaffLayout title="Dashboard" actions={<>
      <Button asChild variant="outline"><Link to="/review">{toLabel} sessions to label</Link></Button>
      <Button asChild className="bg-amber text-amber-foreground hover:bg-amber/90 font-bold"><Link to="/game-period">Start game period</Link></Button>
    </>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.k} className="p-5"><p className="text-sm font-semibold text-muted-foreground">{s.k}</p><p className="mt-1 text-4xl font-extrabold text-navy">{s.v}</p></Card>
        ))}
        <Card className="p-5">
          <p className="text-sm font-semibold text-muted-foreground">Labelled</p>
          <p className="mt-1 text-4xl font-extrabold text-navy">{labelled}<span className="text-lg text-muted-foreground"> of {sessions.length}</span></p>
          <Progress className="mt-3" value={(labelled / Math.max(1, sessions.length)) * 100} />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-navy">My classes</h2>
          <ul className="divide-y">
            {CLASSES.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div><p className="font-bold text-navy">{c.name}</p><p className="text-sm text-muted-foreground">{students.filter((s) => s.classId === c.id).length} students</p></div>
                <Button asChild variant="outline" size="sm"><Link to="/classes" search={{ c: c.id }}>Open</Link></Button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold text-navy">Next steps</h2>
          <ol className="space-y-3">
            {["Add students to a class", "Run a game period in the lab", "Review sessions and assign labels"].map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber font-extrabold text-amber-foreground">{i + 1}</span>
                <span className="pt-0.5 font-semibold">{t}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </StaffLayout>
  );
}
