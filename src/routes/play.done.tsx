import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sun, StudentShell } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/play/done")({
  head: () => ({
    meta: [
      { title: "All done — Lumen" },
      { name: "description", content: "Session finished." },
      { property: "og:title", content: "All done — Lumen" },
      { property: "og:description", content: "Session finished." },
    ],
  }),
  component: Done,
});

function Done() {
  const { setPlayer } = useStore();
  const nav = useNavigate();
  return (
    <StudentShell>
      <Sun className="h-32 w-32 animate-shine" />
      <h1 className="mt-6 text-5xl font-extrabold text-navy">Great job!</h1>
      <p className="mt-4 max-w-lg text-center text-2xl text-navy">You finished. Please tell your teacher and wait quietly.</p>
      <Button className="mt-10 h-16 w-64 rounded-2xl bg-amber text-2xl font-bold text-amber-foreground hover:bg-amber/90" onClick={() => { setPlayer(null); nav({ to: "/play" }); }}>Done</Button>
    </StudentShell>
  );
}
