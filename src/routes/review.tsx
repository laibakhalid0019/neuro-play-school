import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, EmptyState, LabelChip, NativeSelect } from "@/components/lumen";
import { estimate, labelStatus, useStore, type LabelValue } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review and Label — Lumen" },
      { name: "description", content: "Review recorded game sessions and assign Risk or No Risk screening labels." },
      { property: "og:title", content: "Review and Label — Lumen" },
      { property: "og:description", content: "Review recorded game sessions and assign Risk or No Risk screening labels." },
    ],
  }),
  component: Review,
});

type Choice = LabelValue | "none";

function Review() {
  const { myClasses, students, sessions, labels, setLabel, reviewFocus, setReviewFocus } = useStore();
  const focusStudent = reviewFocus ? students.find((s) => s.code === reviewFocus) : undefined;
  const [cls, setCls] = useState(focusStudent?.classId ?? myClasses[0]?.id ?? "");
  const [show, setShow] = useState<"unlabelled" | "labelled" | "all">(focusStudent ? "all" : "unlabelled");
  const [selected, setSelected] = useState<string | null>(reviewFocus);
  const [choice, setChoice] = useState<Choice>("none");
  const [note, setNote] = useState("");
  useEffect(() => { if (reviewFocus) setReviewFocus(null); }, [reviewFocus, setReviewFocus]);

  const played = students.filter((s) => s.classId === cls && sessions.some((x) => x.studentCode === s.code));
  const list = played.filter((s) => show === "all" || (show === "labelled" ? !!labels[s.code] : !labels[s.code]));
  const current = list.find((s) => s.code === selected) ?? list[0];
  const code = current?.code;
  useEffect(() => {
    const l = code ? labels[code] : undefined;
    setChoice(l ? l.value : "none"); setNote(l?.note ?? "");
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const mySessions = code ? sessions.filter((s) => s.studentCode === code) : [];
  const est = estimate(mySessions);

  const save = () => {
    if (!code) return;
    setLabel(code, choice === "none" ? null : choice, note || undefined);
    toast.success(`Saved for ${code}`);
    const idx = played.findIndex((s) => s.code === code);
    const next = [...played.slice(idx + 1), ...played.slice(0, idx)].find((s) => !labels[s.code] && s.code !== code);
    setSelected(next?.code ?? null);
    if (next && show === "labelled") setShow("unlabelled");
  };

  return (
    <AppLayout area="staff" title="Review and Label"
      actions={<>
        <NativeSelect aria-label="Class" value={cls} onChange={(e) => { setCls(e.target.value); setSelected(null); }}>{myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect>
        <NativeSelect aria-label="Show" value={show} onChange={(e) => { setShow(e.target.value as typeof show); setSelected(null); }}>
          <option value="unlabelled">Not labelled</option><option value="labelled">Labelled</option><option value="all">All</option>
        </NativeSelect>
      </>}>
      {!myClasses.length ? <EmptyState title="No classes assigned" text="Ask your institution admin to assign you a class." /> : (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <Card className="max-h-[70vh] overflow-y-auto p-2 shadow-soft">
            {list.length ? list.map((s) => (
              <button key={s.code} onClick={() => setSelected(s.code)}
                className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-sm font-semibold", s.code === code ? "bg-accent text-navy" : "hover:bg-muted")}>
                {s.code}{labels[s.code] && <span className="h-2.5 w-2.5 rounded-full bg-success" aria-label="Labelled" />}
              </button>
            )) : <p className="p-4 text-center text-sm text-muted-foreground">{show === "unlabelled" ? "All students in this class are labelled." : "No students to show."}</p>}
          </Card>
          {current && code ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3"><h2 className="font-mono text-2xl font-extrabold text-navy">{code}</h2><LabelChip status={labelStatus(code, labels, sessions)} /></div>
              <Card className="overflow-x-auto shadow-soft">
                <h3 className="px-4 pt-4 font-bold text-navy">Recorded game sessions</h3>
                <table className="mt-2 w-full text-sm">
                  <thead className="bg-secondary text-left text-navy"><tr>{["Date", "Session time", "Accuracy", "Errors", "Response time"].map((h) => <th key={h} className="px-4 py-2 font-bold">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {mySessions.map((s) => <tr key={s.id}><td className="px-4 py-2">{s.date}</td><td className="px-4 py-2">{s.minutes} min</td><td className="px-4 py-2">{s.accuracy}%</td><td className="px-4 py-2">{s.errors}</td><td className="px-4 py-2">{s.rtMs} ms</td></tr>)}
                  </tbody>
                </table>
              </Card>
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="space-y-3 p-6 shadow-soft">
                  <h3 className="font-bold text-navy">Screening estimate (model)</h3>
                  {est ? <>
                    <LabelChip status={est.value} />
                    <div className="h-3 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", est.value === "Risk" ? "bg-risk" : "bg-success")} style={{ width: `${Math.round(est.prob * 100)}%` }} /></div>
                    <p className="text-sm">Estimated probability of Risk: <b>{Math.round(est.prob * 100)}%</b></p>
                  </> : <p className="text-sm text-muted-foreground">No estimate yet.</p>}
                  <p className="text-xs text-muted-foreground">Screening estimate, not a diagnosis. Shown for reference; your label is independent.</p>
                </Card>
                <Card className="space-y-3 p-6 shadow-soft">
                  <h3 className="font-bold text-navy">Assign label</h3>
                  <div role="radiogroup" className="grid grid-cols-3 gap-2">
                    {([["risk", "Risk"], ["norisk", "No Risk"], ["none", "Leave unlabelled"]] as const).map(([v, l]) => (
                      <button key={v} role="radio" aria-checked={choice === v} onClick={() => setChoice(v)}
                        className={cn("rounded-xl border-2 p-3 text-sm font-bold", choice === v ? "border-primary bg-accent text-navy" : "border-border text-muted-foreground hover:border-primary/50")}>{l}</button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Choose from your professional judgement. Leave it unlabelled if you are unsure. The label is saved as the target value for training.</p>
                  <div className="space-y-1.5"><Label htmlFor="rv-note">Note (optional)</Label><Textarea id="rv-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></div>
                  <Button className="w-full" onClick={save}>Save label and next</Button>
                  <p className="text-xs text-muted-foreground">Screening label only, not a diagnosis. Saved with your name and time.</p>
                </Card>
              </div>
            </div>
          ) : <EmptyState title="Nothing to review" text="Run a game period to record new sessions, or change the filter." />}
        </div>
      )}
    </AppLayout>
  );
}
