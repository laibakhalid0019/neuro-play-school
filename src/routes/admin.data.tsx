import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { AppLayout, ClassToggle, ReadyChip } from "@/components/lumen";
import { MIN_LABELS, readiness, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/data")({
  head: () => ({
    meta: [
      { title: "Data Readiness — Lumen admin" },
      { name: "description", content: "Check which classes have enough labelled sessions for local training." },
      { property: "og:title", content: "Data Readiness — Lumen admin" },
      { property: "og:description", content: "Check which classes have enough labelled sessions for local training." },
    ],
  }),
  component: DataPage,
});

function Row({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <li className="flex items-center gap-2 text-sm">{ok ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-risk" />}{children}</li>;
}

function DataPage() {
  const { classes, students, sessions, labels, featureVectors, setFeatureVectors, log } = useStore();
  const [cls, setCls] = useState("all");
  const [running, setRunning] = useState<number | null>(null);
  const target = new Set(sessions.map((s) => s.studentCode)).size;
  const rerun = () => {
    setRunning(0);
    let p = 0;
    const t = setInterval(() => {
      p += 10;
      setRunning(p);
      if (p >= 100) { clearInterval(t); setFeatureVectors(target); setRunning(null); log(`Local feature extraction finished · ${target} feature vectors ready`); }
    }, 200);
  };
  return (
    <AppLayout area="admin" title="Data Readiness" actions={<ClassToggle value={cls} onChange={setCls} classes={classes} />}>
      <p className="mb-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy">Unlabelled students are never used for training.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.filter((c) => cls === "all" || c.id === cls).map((c) => {
          const r = readiness(c.id, students, sessions, labels);
          return (
            <Card key={c.id} className="space-y-4 p-6 shadow-soft">
              <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-navy">{c.name}</h2><ReadyChip status={r.status} /></div>
              <ul className="space-y-2">
                <Row ok={r.sessions > 0}>Sessions recorded: <b>{r.sessions}</b></Row>
                <Row ok={r.labelled >= MIN_LABELS}>Labelled students: <b>{r.labelled}</b> of {MIN_LABELS} needed</Row>
                <Row ok={r.hasRisk && r.hasNoRisk}>Both labels present (Risk and No Risk)</Row>
              </ul>
              <Progress value={Math.min(100, (r.labelled / MIN_LABELS) * 100)} className="h-2" />
            </Card>
          );
        })}
      </div>
      <Card className="mt-6 space-y-3 p-6 shadow-soft">
        <h2 className="text-lg font-bold text-navy">Local feature extraction</h2>
        <p className="text-sm">Feature schema v1 (set by the Lumen research team, identical in every institution)</p>
        <p className="text-sm text-muted-foreground">Extraction runs automatically on this institution's server.</p>
        <p className="text-sm">Feature vectors ready: <b>{featureVectors}</b></p>
        {running !== null && <Progress value={running} className="h-2" />}
        <Button onClick={rerun} disabled={running !== null}>{running !== null ? "Extracting…" : "Re-run local feature extraction"}</Button>
      </Card>
    </AppLayout>
  );
}
