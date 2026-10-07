import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LabelChip, NativeSelect, StaffLayout } from "@/components/lumen";
import { CLASSES, labelStatus, useStore, type LabelValue } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Show = "unlabelled" | "labelled" | "all";
export const Route = createFileRoute("/review")({
  validateSearch: (s: Record<string, unknown>) => ({
    c: typeof s.c === "string" ? s.c : "4A",
    show: (["unlabelled", "labelled", "all"].includes(s.show as string) ? s.show : "unlabelled") as Show,
    s: typeof s.s === "string" ? s.s : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Review and label — Lumen" },
      { name: "description", content: "Review recorded game sessions and assign screening labels." },
      { property: "og:title", content: "Review and label — Lumen" },
      { property: "og:description", content: "Review recorded game sessions and assign screening labels." },
    ],
  }),
  component: Review,
});

const OPTIONS: { v: LabelValue | "none"; t: string; d: string }[] = [
  { v: "risk", t: "Risk", d: "Behaviour suggests follow-up is worthwhile." },
  { v: "norisk", t: "No Risk", d: "No concern from the recorded sessions." },
  { v: "none", t: "Leave unlabelled", d: "Not sure yet. Decide later." },
];

function Review() {
  const { c, show, s } = Route.useSearch();
  const nav = useNavigate({ from: "/review" });
  const { students, sessions, labels, setLabel } = useStore();
  const played = students.filter((x) => x.classId === c && sessions.some((y) => y.studentCode === x.code));
  const list = played.filter((x) => show === "all" || (show === "labelled" ? labels[x.code] : !labels[x.code]));
  const current = (s && students.find((x) => x.code === s)) || list[0];
  const [choice, setChoice] = useState<LabelValue | "none">("none");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const l = current ? labels[current.code] : undefined;
    setChoice(l?.value ?? "none");
    setNote(l?.note ?? "");
  }, [current?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (!current) return;
    setLabel(current.code, choice === "none" ? null : choice, note || undefined);
    setSaved(`Saved for ${current.code}`);
    const after = played.filter((x) => x.code !== current.code && !labels[x.code]);
    const idx = played.findIndex((x) => x.code === current.code);
    const nextOne = after.find((x) => played.indexOf(x) > idx) ?? after[0];
    nav({ search: (p) => ({ ...p, s: nextOne?.code }) });
  };

  const rows = current ? sessions.filter((x) => x.studentCode === current.code) : [];
  return (
    <StaffLayout title="Review and Label">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <NativeSelect aria-label="Class" value={c} onChange={(e) => nav({ search: { c: e.target.value, show } })}>
          {CLASSES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </NativeSelect>
        <span className="font-semibold">Show:</span>
        {(["unlabelled", "labelled", "all"] as Show[]).map((v) => (
          <Button key={v} size="sm" variant={show === v ? "default" : "outline"} onClick={() => nav({ search: { c, show: v } })}>
            {v === "unlabelled" ? "Not labelled" : v === "labelled" ? "Labelled" : "All"}
          </Button>
        ))}
        {saved && <span className="text-sm font-semibold text-success">{saved}</span>}
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Card className="max-h-[640px] overflow-auto p-2">
          {list.length === 0 && <p className="p-3 text-sm text-muted-foreground">No students here.</p>}
          {list.map((x) => (
            <button key={x.code} onClick={() => nav({ search: (p) => ({ ...p, s: x.code }) })}
              className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold hover:bg-muted", current?.code === x.code && "bg-accent text-navy")}>
              <span className={cn("h-2.5 w-2.5 rounded-full", labels[x.code] ? "bg-success" : "bg-border")} />{x.code}
            </button>
          ))}
        </Card>
        {current ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-bold text-navy">{current.code}</h2>
                <LabelChip status={labelStatus(current.code, labels, sessions)} />
              </div>
              <h3 className="mb-2 font-bold">Recorded game sessions</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Session time</TableHead><TableHead>Accuracy</TableHead><TableHead>Errors</TableHead><TableHead>Response time</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}><TableCell>{r.date}</TableCell><TableCell>{r.minutes} min</TableCell><TableCell>{r.accuracy}%</TableCell><TableCell>{r.errors}</TableCell><TableCell>{r.rtMs} ms</TableCell></TableRow>
                  ))}
                  {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No sessions yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy">Assign label</h3>
              <p className="mb-4 text-sm text-muted-foreground">Choose from your professional judgement. Leave it unlabelled if you are unsure. The label is saved as the target value for training.</p>
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
                {OPTIONS.map((o) => (
                  <button key={o.v} role="radio" aria-checked={choice === o.v} onClick={() => setChoice(o.v)}
                    className={cn("rounded-xl border-2 p-4 text-left transition", choice === o.v ? "border-primary bg-accent" : "border-border hover:border-primary/50")}>
                    <span className="flex items-center gap-2 font-bold text-navy">
                      <span className={cn("h-4 w-4 rounded-full border-2", choice === o.v ? "border-primary bg-primary" : "border-input")} />{o.t}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{o.d}</span>
                  </button>
                ))}
              </div>
              <Textarea className="mt-4" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">Screening label only, not a diagnosis. Saved with your name and time.</p>
                <Button onClick={save}>Save label and next</Button>
              </div>
            </Card>
          </div>
        ) : <Card className="p-8 text-muted-foreground">All students in this view are done. Try another filter.</Card>}
      </div>
    </StaffLayout>
  );
}
