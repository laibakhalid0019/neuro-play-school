import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, LabelChip, NativeSelect } from "@/components/lumen";
import { estimate, labelStatus, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Lumen" },
      { name: "description", content: "Screening reports for students who have played, by class." },
      { property: "og:title", content: "Reports — Lumen" },
      { property: "og:description", content: "Screening reports for students who have played, by class." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { myClasses, students, sessions, labels } = useStore();
  const [sel, setSel] = useState("");
  const classId = myClasses.some((c) => c.id === sel) ? sel : myClasses[0]?.id ?? "";

  const played = students
    .filter((s) => s.classId === classId && sessions.some((x) => x.studentCode === s.code))
    .map((s) => {
      const list = sessions.filter((x) => x.studentCode === s.code);
      const est = estimate(list);
      return {
        code: s.code,
        count: list.length,
        latest: list[list.length - 1]?.accuracy ?? 0,
        estimate: est ? `${est.value} (${Math.round(est.prob * 100)}%)` : "No estimate yet",
        label: labelStatus(s.code, labels, sessions),
      };
    });

  return (
    <AppLayout area="staff" title="Reports"
      actions={<>
        {myClasses.length > 0 && <NativeSelect aria-label="Class" value={classId} onChange={(e) => setSel(e.target.value)}>{myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect>}
        <Button asChild variant="outline"><Link to="/reports/summary">Class summary</Link></Button>
      </>}>
      {classId ? (
        played.length ? (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-muted-foreground">
                <tr>{["Student code", "Sessions", "Latest accuracy", "Model estimate", "Teacher label", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {played.map((r) => (
                  <tr key={r.code}>
                    <td className="px-4 py-3 font-medium">{r.code}</td>
                    <td className="px-4 py-3">{r.count}</td>
                    <td className="px-4 py-3">{r.latest}%</td>
                    <td className="px-4 py-3">{r.estimate}</td>
                    <td className="px-4 py-3"><LabelChip status={r.label} /></td>
                    <td className="px-4 py-3 text-right"><Link to="/reports/$code" params={{ code: r.code }} className="font-semibold text-teal hover:underline">View report</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : <EmptyState title="No reports yet" text="Reports appear after students have played a game period." />
      ) : <EmptyState title="No classes assigned" text="Ask your institution admin to assign you a class." />}
    </AppLayout>
  );
}
