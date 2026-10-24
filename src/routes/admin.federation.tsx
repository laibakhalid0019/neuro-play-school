import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppLayout, Pill } from "@/components/lumen";
import { INSTITUTION_ID, readiness, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/federation")({
  head: () => ({
    meta: [
      { title: "Federation — Lumen admin" },
      { name: "description", content: "Join federated learning rounds: only model weights leave the institution." },
      { property: "og:title", content: "Federation — Lumen admin" },
      { property: "og:description", content: "Join federated learning rounds: only model weights leave the institution." },
    ],
  }),
  component: FederationPage,
});

const STEPS = ["Global model received", "Local training on labelled students", "Weights sent", "Global server aggregates (FedAvg)", "Updated global model received"];
const EPOCHS = 10;

function FederationPage() {
  const { classes, students, sessions, labels, federation, completeRound } = useStore();
  const [step, setStep] = useState(-1); // -1 idle, 0..4 running, 5 done
  const [losses, setLosses] = useState<{ epoch: number; loss: number }[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const ready = classes.filter((c) => readiness(c.id, students, sessions, labels).status === "Ready for training");
  const trainCount = ready.reduce((n, c) => n + readiness(c.id, students, sessions, labels).labelled, 0);
  const running = step >= 0 && step < 5;

  const run = () => {
    setLosses([]); setStep(0);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(1200, () => setStep(1));
    for (let e = 1; e <= EPOCHS; e++) at(1200 + e * 350, () => setLosses((l) => [...l, { epoch: e, loss: +(0.72 * Math.exp(-e / 4) + 0.12 + Math.random() * 0.02).toFixed(3) }]));
    at(1200 + EPOCHS * 350 + 400, () => setStep(2));
    at(1200 + EPOCHS * 350 + 1800, () => setStep(3));
    at(1200 + EPOCHS * 350 + 3400, () => setStep(4));
    at(1200 + EPOCHS * 350 + 4600, () => { setStep(5); completeRound(); });
  };

  return (
    <AppLayout area="admin" title="Federation">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-2 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-navy">Membership</h2>
          <p className="text-sm">Status: <Pill tone="success">Approved</Pill></p>
          <p className="text-sm">Coordinator: <b>Lumen coordinator (placeholder)</b></p>
          <p className="text-sm">Institution ID: <span className="font-mono font-bold">{INSTITUTION_ID}</span></p>
        </Card>
        <Card className="space-y-2 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-navy">Global model</h2>
          <p className="text-4xl font-extrabold text-navy">v1.{federation.minor}</p>
          <p className="text-sm">Last round: <b>#{federation.round}</b> ({federation.lastRoundAt})</p>
          <p className="text-sm">Round state: <Pill tone={running ? "amber" : "success"}>{running ? "Training" : federation.state}</Pill></p>
        </Card>
        <Card className="space-y-3 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-navy">Join next FL round</h2>
          {ready.length ? (
            <p className="text-sm">Ready classes: <b>{ready.map((c) => c.name).join(", ")}</b> · {trainCount} labelled students used for training.</p>
          ) : (
            <p className="text-sm text-risk">Not available: no class is Ready for training yet. Label more students in Data Readiness.</p>
          )}
          <Button className="w-full" disabled={!ready.length || running} onClick={run}>{running ? "Round in progress…" : "Simulate FL round"}</Button>
        </Card>
      </div>

      {step >= 0 && (
        <Card className="mt-6 p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold text-navy">FL round #{step === 5 ? federation.round : federation.round + 1}</h2>
          <ol className="grid gap-3 md:grid-cols-5">
            {STEPS.map((s, i) => {
              const state = i < step || step === 5 ? "done" : i === step ? "active" : "todo";
              return (
                <li key={s} className={cn("rounded-xl border-2 p-3 text-sm", state === "done" && "border-success bg-success-soft", state === "active" && "border-primary bg-accent", state === "todo" && "border-border opacity-60")}>
                  <div className="mb-1 flex items-center gap-2 font-bold text-navy">
                    {state === "done" ? <Check className="h-4 w-4 text-success" /> : state === "active" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="text-muted-foreground">{i + 1}</span>}
                    Step {i + 1}
                  </div>
                  {s}
                  {i === 1 && step >= 1 && <p className="mt-1 text-xs font-semibold">Epoch {losses.length} of {EPOCHS}</p>}
                  {i === 2 && step >= 2 && <p className="mt-1 text-xs font-semibold">Model weights only · 134 KB</p>}
                  {i === 4 && step === 5 && <p className="mt-1 text-xs font-semibold">Now using v1.{federation.minor}</p>}
                </li>
              );
            })}
          </ol>
          {losses.length > 0 && (
            <div className="mt-6 h-48">
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Local training loss</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={losses}><XAxis dataKey="epoch" /><YAxis domain={[0, 1]} /><Tooltip /><Line type="monotone" dataKey="loss" stroke="var(--primary)" strokeWidth={3} dot={false} isAnimationActive={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-primary p-6 shadow-soft">
          <h3 className="font-bold text-navy">Sent to the global server: model weights only</h3>
          <p className="mt-2 text-sm text-muted-foreground">A small file of numbers learned by the local model. It contains no student records.</p>
        </Card>
        <Card className="border-2 border-success p-6 shadow-soft">
          <h3 className="font-bold text-navy">Never leaves this institution</h3>
          <p className="mt-2 text-sm text-muted-foreground">Student records, sessions, labels, names.</p>
        </Card>
      </div>
    </AppLayout>
  );
}
