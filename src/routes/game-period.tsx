import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Monitor } from "lucide-react";
import { NativeSelect, StaffLayout, StatusChip } from "@/components/lumen";
import { CLASSES, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/game-period")({
  head: () => ({
    meta: [
      { title: "Game period — Lumen" },
      { name: "description", content: "Run and monitor a class game period in the computer lab." },
      { property: "og:title", content: "Game period — Lumen" },
      { property: "og:description", content: "Run and monitor a class game period in the computer lab." },
    ],
  }),
  component: GamePeriod,
});

function GamePeriod() {
  const { period, startPeriod, endPeriod, students } = useStore();
  const [classId, setClassId] = useState(period?.classId ?? "4A");
  const cls = CLASSES.find((c) => c.id === (period?.classId ?? classId))!;

  if (!period) {
    return (
      <StaffLayout title="Game Period">
        <Card className="max-w-xl p-8">
          <h2 className="text-xl font-bold text-navy">Start a game period</h2>
          <p className="mt-1 text-muted-foreground">Take the class to the computer lab. Each student plays on their own PC.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <NativeSelect value={classId} onChange={(e) => setClassId(e.target.value)}>
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name} ({students.filter((s) => s.classId === c.id).length} students)</option>)}
            </NativeSelect>
            <Button className="bg-amber font-bold text-amber-foreground hover:bg-amber/90" onClick={() => startPeriod(classId)}>Start game period</Button>
          </div>
        </Card>
      </StaffLayout>
    );
  }

  const seats = Object.entries(period.seats);
  const done = seats.filter(([, s]) => s.status === "Finished").length;
  return (
    <StaffLayout title="Game Period" actions={period.open
      ? <Button variant="destructive" onClick={endPeriod}>End period</Button>
      : <Button onClick={() => startPeriod(classId)}>Start new period</Button>}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="flex flex-wrap items-center gap-4 p-5">
            <div><p className="text-sm text-muted-foreground">Class</p><p className="font-bold text-navy">{cls.name}</p></div>
            <div><p className="text-sm text-muted-foreground">Room</p><p className="font-bold text-navy">Computer lab</p></div>
            <span className={period.open ? "rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success" : "rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground"}>
              {period.open ? "Period open" : "Period ended"}
            </span>
            <div className="ml-auto w-full sm:w-64">
              <p className="mb-1 text-sm font-semibold">{done} of {seats.length} finished</p>
              <Progress value={(done / Math.max(1, seats.length)) * 100} />
            </div>
          </Card>
          <Card className="p-2">
            <ul className="grid gap-1 sm:grid-cols-2">
              {seats.map(([code, s]) => (
                <li key={code} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="w-14 text-sm text-muted-foreground">PC {String(s.pc).padStart(2, "0")}</span>
                  <span className="font-bold text-navy">{code}</span>
                  <span className="ml-auto"><StatusChip status={s.status} /></span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <Card className="h-fit bg-navy p-8 text-center text-navy-foreground">
          <p className="text-sm font-semibold opacity-80">Class code</p>
          <p className="my-3 font-mono text-5xl font-extrabold tracking-widest text-amber">{period.code}</p>
          <p className="text-sm opacity-80">Students type this code on their lab PC.</p>
          <Link to="/play" className="mt-6 inline-block font-bold text-amber underline">Preview student screen</Link>
        </Card>
      </div>
    </StaffLayout>
  );
}
