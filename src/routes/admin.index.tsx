import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppLayout, ClassToggle, EmptyState, Pill, StatCard } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Lumen" },
      { name: "description", content: "Institution overview: staff, classes, sessions and labelling progress." },
      { property: "og:title", content: "Admin overview — Lumen" },
      { property: "og:description", content: "Institution overview: staff, classes, sessions and labelling progress." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { classes, staff, students, sessions, labels, federation, activity } = useStore();
  const [cls, setCls] = useState("all");
  const inScope = students.filter((s) => cls === "all" || s.classId === cls);
  const codes = new Set(inScope.map((s) => s.code));
  const sess = sessions.filter((s) => codes.has(s.studentCode));
  const played = new Set(sess.map((s) => s.studentCode));
  const labelled = [...played].filter((c) => labels[c]).length;
  const staffCount = cls === "all" ? staff.length : staff.filter((t) => t.classIds.includes(cls)).length;
  const chart = classes.filter((c) => cls === "all" || c.id === cls).map((c) => {
    const cs = students.filter((s) => s.classId === c.id).map((s) => s.code);
    const l = cs.filter((x) => labels[x]).length;
    return { name: c.name, Labelled: l, "Not labelled": cs.length - l };
  });
  return (
    <AppLayout area="admin" title="Overview" actions={<ClassToggle value={cls} onChange={setCls} classes={classes} />}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Teachers" value={staffCount} />
        <StatCard label="Classes" value={cls === "all" ? classes.length : 1} />
        <StatCard label="Students" value={inScope.length} />
        <StatCard label="Sessions recorded" value={sess.length} />
        <StatCard label="Labelled" value={`${labelled} of ${sess.length}`} progress={sess.length ? (labelled / sess.length) * 100 : 0} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 shadow-soft lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-navy">Labelled vs not labelled</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
                <Bar dataKey="Labelled" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Not labelled" stackId="a" fill="var(--amber)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="space-y-3 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-navy">Federation at a glance</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Model version</dt><dd className="font-bold">v1.{federation.minor}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Last round</dt><dd className="font-bold">#{federation.round} · {federation.lastRoundAt}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Pill tone="success">{federation.state}</Pill></dd></div>
          </dl>
          <Button asChild variant="outline" className="w-full"><Link to="/admin/federation">Open Federation</Link></Button>
        </Card>
      </div>
      <Card className="mt-6 p-6 shadow-soft">
        <h2 className="mb-3 text-lg font-bold text-navy">Recent activity</h2>
        {activity.length ? (
          <ul className="divide-y">
            {activity.slice(0, 8).map((a) => <li key={a.id} className="flex justify-between gap-4 py-2 text-sm"><span>{a.text}</span><span className="whitespace-nowrap text-muted-foreground">{a.at}</span></li>)}
          </ul>
        ) : <EmptyState title="No activity yet" />}
      </Card>
    </AppLayout>
  );
}
