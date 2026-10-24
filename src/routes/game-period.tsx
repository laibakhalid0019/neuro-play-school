import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, NativeSelect, Pill, StatusChip } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/game-period")({
  head: () => ({
    meta: [
      { title: "Game Period — Lumen" },
      { name: "description", content: "Open a game period in the computer lab and follow students live." },
      { property: "og:title", content: "Game Period — Lumen" },
      { property: "og:description", content: "Open a game period in the computer lab and follow students live." },
    ],
  }),
  component: GamePeriod,
});

function GamePeriod() {
  const { myClasses, classes, period, startPeriod, endPeriod, clearPeriod } = useStore();
  const [classId, setClassId] = useState("");
  const chosen = classId || myClasses[0]?.id || "";
  const mine = period && myClasses.some((c) => c.id === period.classId) ? period : null;

  if (!mine) {
    return (
      <AppLayout area="staff" title="Game Period">
        {myClasses.length ? (
          <Card className="max-w-lg space-y-4 p-6 shadow-soft">
            <h2 className="text-lg font-bold text-navy">Set up a game period</h2>
            <div className="space-y-1.5"><Label htmlFor="gp-c">Class</Label>
              <NativeSelect id="gp-c" className="w-full" value={chosen} onChange={(e) => setClassId(e.target.value)}>{myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect></div>
            <div className="space-y-1.5"><Label htmlFor="gp-l">Lab</Label><NativeSelect id="gp-l" className="w-full"><option>Computer lab</option></NativeSelect></div>
            <Button className="w-full" onClick={() => startPeriod(chosen)}>Start game period</Button>
          </Card>
        ) : <EmptyState title="No classes assigned" text="Ask your institution admin to assign you a class." />}
      </AppLayout>
    );
  }

  const seats = Object.entries(mine.seats).sort((a, b) => a[1].pc - b[1].pc);
  const finished = seats.filter(([, s]) => s.status === "Finished").length;
  const name = classes.find((c) => c.id === mine.classId)?.name ?? mine.classId;
  return (
    <AppLayout area="staff" title={`Game Period · ${name}`}
      actions={mine.open ? <Button variant="destructive" onClick={endPeriod}>End period</Button> : <Button onClick={clearPeriod}>Set up a new period</Button>}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 bg-navy p-6 text-center text-navy-foreground shadow-soft">
          <Pill tone={mine.open ? "success" : "muted"}>{mine.open ? "Period open" : "Period ended"}</Pill>
          <p className="text-sm opacity-80">Class code — students type this on their lab PC</p>
          <p className="font-mono text-5xl font-extrabold tracking-widest text-amber">{mine.code}</p>
          <p className="text-sm opacity-80">{mine.lab}</p>
          {mine.open && <Link to="/play" target="_blank" className="inline-block text-sm font-bold underline">Preview student screen</Link>}
        </Card>
        <Card className="p-6 shadow-soft lg:col-span-2">
          <div className="mb-2 flex justify-between text-sm font-bold"><span>{finished} of {seats.length} finished</span></div>
          <Progress value={seats.length ? (finished / seats.length) * 100 : 0} className="h-2" />
          {!mine.open && <p className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">Period ended. Sessions for finished students were saved and are ready to review.</p>}
          {seats.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {seats.map(([code, s]) => (
                <div key={code} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span><span className="text-muted-foreground">PC {s.pc}</span> · <span className="font-mono font-semibold">{code}</span></span><StatusChip status={s.status} />
                </div>
              ))}
            </div>
          ) : <div className="mt-4"><EmptyState title="No students in this class" /></div>}
        </Card>
      </div>
    </AppLayout>
  );
}
