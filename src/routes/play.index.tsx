import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Logo, StudentShell } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Let's play — Lumen" },
      { name: "description", content: "Student start screen for the lab PC." },
      { property: "og:title", content: "Let's play — Lumen" },
      { property: "og:description", content: "Student start screen for the lab PC." },
    ],
  }),
  component: Start,
});

function Start() {
  const { students, period, setPlayer } = useStore();
  const nav = useNavigate();
  const [cc, setCc] = useState(period?.code ?? "");
  const [sc, setSc] = useState("");
  const [err, setErr] = useState("");
  const go = (e: FormEvent) => {
    e.preventDefault();
    const code = sc.trim().toUpperCase();
    const cls = cc.trim().toUpperCase();
    const demo = cls === DEMO_CLASS_CODE && code === DEMO_STUDENT_CODE;
    if (!demo) {
      if (!period?.open || cls !== period.code) return setErr("Hmm, that class code is not open. Check the board or ask your teacher.");
      if (!period.seats[code]) return setErr("Hmm, that student code is not right. Ask your teacher.");
    }
    if (!students.some((s) => s.code === code)) return setErr("Hmm, that student code is not right. Ask your teacher.");
    setPlayer({ classCode: cls, studentCode: code });
    nav({ to: "/play/tutorial" });
  };
  const field = "h-16 w-full rounded-2xl border-2 border-amber/50 bg-card px-5 text-center text-2xl font-bold uppercase tracking-widest text-navy focus:border-amber focus:outline-none";
  return (
    <StudentShell>
      <Logo size="xl" />
      <form onSubmit={go} className="mt-10 w-full max-w-md space-y-5">
        <label className="block"><span className="mb-2 block text-center text-xl font-bold text-navy">Class code</span>
          <input className={field} value={cc} onChange={(e) => setCc(e.target.value)} placeholder="4A-7K2" required /></label>
        <label className="block"><span className="mb-2 block text-center text-xl font-bold text-navy">Student code</span>
          <input className={field} value={sc} onChange={(e) => setSc(e.target.value)} placeholder="S-4A-01" required /></label>
        {err && <p className="text-center text-lg font-semibold text-risk">{err}</p>}
        <Button type="submit" className="h-20 w-full rounded-3xl bg-amber text-3xl font-extrabold text-amber-foreground hover:bg-amber/90">Start</Button>
      </form>
    </StudentShell>
  );
}
