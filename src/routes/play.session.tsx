import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Star, Volume2, VolumeX } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/session")({
  head: () => ({
    meta: [
      { title: "Play — Lumen" },
      { name: "description", content: "Student play session." },
      { property: "og:title", content: "Play — Lumen" },
      { property: "og:description", content: "Student play session." },
    ],
  }),
  component: Session,
});

const ROUNDS = 12;

function Session() {
  const { player, recordSession } = useStore();
  const nav = useNavigate();
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(true);
  const [round, setRound] = useState(0);
  const [lit, setLit] = useState(false);
  const litAt = useRef(0);
  const start = useRef(Date.now());
  const stats = useRef({ hits: 0, misses: 0, falseTaps: 0, rts: [] as number[] });

  useEffect(() => {
    if (paused || round >= ROUNDS) return;
    const delay = 900 + Math.random() * 1500;
    const on = setTimeout(() => { setLit(true); litAt.current = Date.now(); }, delay);
    const off = setTimeout(() => { setLit((l) => { if (l) stats.current.misses++; return false; }); setRound((r) => r + 1); }, delay + 1400);
    return () => { clearTimeout(on); clearTimeout(off); };
  }, [round, paused]);

  const tap = () => {
    if (paused) return;
    if (lit) { stats.current.hits++; stats.current.rts.push(Date.now() - litAt.current); setLit(false); }
    else stats.current.falseTaps++;
  };

  const finish = () => {
    const s = stats.current;
    const total = Math.max(1, s.hits + s.misses + s.falseTaps);
    if (player) recordSession({
      studentCode: player.studentCode,
      minutes: Math.max(1, Math.round((Date.now() - start.current) / 60000)),
      accuracy: Math.round((s.hits / total) * 100),
      errors: s.misses + s.falseTaps,
      rtMs: s.rts.length ? Math.round(s.rts.reduce((a, b) => a + b, 0) / s.rts.length) : 0,
    });
    nav({ to: "/play/done" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="h-14 rounded-2xl px-6 text-lg font-bold" onClick={() => setPaused(!paused)}>
          {paused ? <Play className="mr-2" /> : <Pause className="mr-2" />}{paused ? "Resume" : "Pause"}
        </Button>
        <Progress className="h-4 flex-1" value={(Math.min(round, ROUNDS) / ROUNDS) * 100} />
        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl" aria-label="Sound" onClick={() => setSound(!sound)}>
          {sound ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>
      <div className="my-6 flex flex-1 flex-col items-center justify-center rounded-[2rem] border-4 border-dashed border-amber/40 bg-card p-8">
        <p className="mb-6 text-xl font-bold text-muted-foreground">Serious game area</p>
        {round >= ROUNDS ? (
          <p className="text-3xl font-extrabold text-navy">All rounds done! Tap Finish.</p>
        ) : (
          <button onClick={tap} aria-label="Star" className="rounded-full p-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring">
            <Star className={cn("h-48 w-48 transition", lit ? "animate-shine fill-amber text-amber" : "fill-muted text-border")} strokeWidth={1.2} />
          </button>
        )}
        {paused && <p className="mt-4 text-2xl font-bold text-navy">Paused</p>}
      </div>
      <Button className="mx-auto h-16 w-full max-w-md rounded-2xl bg-navy text-xl font-bold text-navy-foreground hover:bg-navy/90" onClick={finish}>Finish session</Button>
    </div>
  );
}
