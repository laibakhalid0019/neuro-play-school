import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { StudentShell } from "@/components/lumen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial — Lumen" },
      { name: "description", content: "A short practice before playing." },
      { property: "og:title", content: "Tutorial — Lumen" },
      { property: "og:description", content: "A short practice before playing." },
    ],
  }),
  component: Tutorial,
});

const STEPS = [
  { t: "Tap the star when it shines!", s: "Watch closely. The star will glow." },
  { t: "Let's practice first.", s: "There is no wrong answer here." },
  { t: "You are ready!", s: "Take your time and have fun." },
];

function Tutorial() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  return (
    <StudentShell>
      <h1 className="mb-6 text-2xl font-extrabold text-navy">Tutorial</h1>
      <div className="w-full max-w-lg rounded-[2rem] bg-card p-10 text-center shadow-soft">
        <Star className="mx-auto h-40 w-40 animate-shine fill-amber text-amber" strokeWidth={1.2} />
        <p className="mt-6 text-3xl font-extrabold text-navy">{STEPS[i]?.t}</p>
        <p className="mt-2 text-xl text-muted-foreground">{STEPS[i]?.s}</p>
        <div className="mt-6 flex justify-center gap-2" aria-label={`Step ${i + 1} of 3`}>
          {STEPS.map((_, k) => <span key={k} className={cn("h-3 w-3 rounded-full", k === i ? "bg-amber" : "bg-border")} />)}
        </div>
      </div>
      <div className="mt-8 flex w-full max-w-lg gap-4">
        <Button variant="outline" className="h-16 flex-1 rounded-2xl text-xl font-bold" onClick={() => (i ? setI(i - 1) : nav({ to: "/play" }))}>Back</Button>
        <Button className="h-16 flex-1 rounded-2xl bg-amber text-xl font-bold text-amber-foreground hover:bg-amber/90" onClick={() => (i < 2 ? setI(i + 1) : nav({ to: "/play/session" }))}>Next</Button>
      </div>
    </StudentShell>
  );
}
