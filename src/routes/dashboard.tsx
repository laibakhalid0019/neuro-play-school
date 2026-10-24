import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, EmptyState, StatCard } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumen" },
      { name: "description", content: "Your classes, sessions played and labelling progress." },
      { property: "og:title", content: "Dashboard — Lumen" },
      { property: "og:description", content: "Your classes, sessions played and labelling progress." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { myClasses, students, sessions, labels, user } = useStore();
  const ids = new Set(myClasses.map((c) => c.id));
  const mine = students.filter((s) => ids.has(s.classId));
  const codes = new Set(mine.map((s) => s.code));
  const sess = sessions.filter((s) => codes.has(s.studentCode));
  const played = [...new Set(sess.map((s) => s.studentCode))];
  const labelled = played.filter((c) => labels[c]).length;
  return (
    <AppLayout area="staff" title={`Welcome, ${user?.name ?? ""}`}
      actions={<><Button asChild><Link to="/game-period">Start game period</Link></Button><Button asChild variant="outline"><Link to="/review">Sessions to label</Link></Button></>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My classes" value={myClasses.length} />
        <StatCard label="Students" value={mine.length} />
        <StatCard label="Sessions played" value={sess.length} />
        <StatCard label="Labelled" value={`${labelled} of ${played.length}`} progress={played.length ? (labelled / played.length) * 100 : 0} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 shadow-soft lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-navy">My classes</h2>
          {myClasses.length ? (
            <ul className="divide-y">
              {myClasses.map((c) => {
                const n = mine.filter((s) => s.classId === c.id);
                const l = n.filter((s) => labels[s.code]).length;
                return (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div><p className="font-bold">{c.name}</p><p className="text-sm text-muted-foreground">{n.length} students · {l} labelled</p></div>
                    <Button asChild size="sm" variant="outline"><Link to="/classes">Open</Link></Button>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState title="No classes assigned" text="Ask your institution admin to assign you a class." />}
        </Card>
        <Card className="p-6 shadow-soft">
          <h2 className="mb-3 text-lg font-bold text-navy">Next steps</h2>
          <ol className="space-y-3 text-sm">
            {["Add students to a class", "Run a game period in the lab", "Review sessions and assign labels"].map((t, i) => (
              <li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber font-bold text-amber-foreground">{i + 1}</span>{t}</li>
            ))}
          </ol>
        </Card>
      </div>
    </AppLayout>
  );
}
