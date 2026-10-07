import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "Teacher" | "Clinician";
export type LabelValue = "risk" | "norisk";
export type PlayStatus = "Waiting" | "Playing" | "Paused" | "Finished";

export interface ClassInfo { id: string; name: string; year: string }
export interface Student { code: string; classId: string; dob: string; year: string; gender?: string; consent: boolean }
export interface Session { id: string; studentCode: string; date: string; minutes: number; accuracy: number; errors: number; rtMs: number }
export interface Label { value: LabelValue; note?: string; by: string; at: string }
export interface Period { classId: string; code: string; open: boolean; seats: Record<string, { pc: number; status: PlayStatus }> }
export interface User { name: string; email: string; role: Role; institution: string }

export const CLASSES: ClassInfo[] = [
  { id: "4A", name: "Class 4A", year: "Year 4" },
  { id: "4B", name: "Class 4B", year: "Year 4" },
  { id: "5A", name: "Class 5A", year: "Year 5" },
];

// deterministic pseudo random
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const pad = (n: number) => String(n).padStart(2, "0");

function makeSession(code: string, date: string, i: number): Session {
  return {
    id: `${code}-${i}-${Math.round(rnd() * 1e6)}`,
    studentCode: code,
    date,
    minutes: Math.round(14 + rnd() * 12),
    accuracy: Math.round(62 + rnd() * 34),
    errors: Math.round(2 + rnd() * 14),
    rtMs: Math.round(480 + rnd() * 620),
  };
}

function seedData() {
  const sizes: Record<string, [number, number, number]> = { "4A": [24, 20, 14], "4B": [25, 20, 14], "5A": [23, 18, 12] };
  const students: Student[] = [];
  const sessions: Session[] = [];
  const labels: Record<string, Label> = {};
  for (const c of CLASSES) {
    const [size, played, labelled] = sizes[c.id];
    for (let i = 1; i <= size; i++) {
      const code = `S-${c.id}-${pad(i)}`;
      const by = c.id === "5A" ? 9 : 8;
      students.push({ code, classId: c.id, dob: `201${c.id.startsWith("5") ? 6 : 7}-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 27))}`, year: c.year, consent: true });
      if (i <= played) {
        sessions.push(makeSession(code, `2026-09-${pad(14 + (i % 10))}`, 1));
        if (i <= labelled) labels[code] = { value: rnd() < 0.25 ? "risk" : "norisk", by: "Ms. Okafor (Teacher)", at: `2026-09-2${by % 10}T10:00:00Z` };
      }
    }
  }
  return { students, sessions, labels };
}

interface Store {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  students: Student[];
  sessions: Session[];
  labels: Record<string, Label>;
  addStudent: (s: Student) => void;
  setLabel: (code: string, value: LabelValue | null, note?: string) => void;
  period: Period | null;
  startPeriod: (classId: string) => void;
  endPeriod: () => void;
  recordSession: (s: Omit<Session, "id" | "date">) => void;
  player: { classCode: string; studentCode: string } | null;
  setPlayer: (p: Store["player"]) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(seedData, []);
  const [user, setUser] = useState<User | null>({ name: "Ms. Okafor", email: "okafor@school.edu", role: "Teacher", institution: "Riverside Primary School" });
  const [students, setStudents] = useState(initial.students);
  const [sessions, setSessions] = useState(initial.sessions);
  const [labels, setLabels] = useState(initial.labels);
  const [period, setPeriod] = useState<Period | null>(null);
  const [player, setPlayer] = useState<Store["player"]>(null);

  const today = () => new Date().toISOString().slice(0, 10);

  // simulate live lab activity
  useEffect(() => {
    if (!period?.open) return;
    const t = setInterval(() => {
      setPeriod((p) => {
        if (!p || !p.open) return p;
        const seats = { ...p.seats };
        const finishedNow: string[] = [];
        for (const code of Object.keys(seats)) {
          const s = seats[code];
          const r = Math.random();
          if (s.status === "Waiting" && r < 0.35) seats[code] = { ...s, status: "Playing" };
          else if (s.status === "Playing" && r < 0.06) seats[code] = { ...s, status: "Paused" };
          else if (s.status === "Playing" && r < 0.16) { seats[code] = { ...s, status: "Finished" }; finishedNow.push(code); }
          else if (s.status === "Paused" && r < 0.4) seats[code] = { ...s, status: "Playing" };
        }
        if (finishedNow.length) setSessions((ss) => [...ss, ...finishedNow.map((c, i) => makeSession(c, today(), ss.length + i))]);
        return { ...p, seats };
      });
    }, 1800);
    return () => clearInterval(t);
  }, [period?.open]);

  const store: Store = {
    user,
    login: setUser,
    logout: () => setUser(null),
    students, sessions, labels, period, player, setPlayer,
    addStudent: (s) => setStudents((x) => [...x, s]),
    setLabel: (code, value, note) =>
      setLabels((l) => {
        const n = { ...l };
        if (value) n[code] = { value, note, by: `${user?.name ?? "Staff"} (${user?.role ?? ""})`, at: new Date().toISOString() };
        else delete n[code];
        return n;
      }),
    startPeriod: (classId) => {
      const code = `${classId}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      const seats: Period["seats"] = {};
      students.filter((s) => s.classId === classId).forEach((s, i) => (seats[s.code] = { pc: i + 1, status: "Waiting" }));
      setPeriod({ classId, code, open: true, seats });
    },
    endPeriod: () => setPeriod((p) => (p ? { ...p, open: false } : p)),
    recordSession: (s) => {
      setSessions((ss) => [...ss, { ...s, id: `${s.studentCode}-${Date.now()}`, date: today() }]);
      setPeriod((p) => (p && p.seats[s.studentCode] ? { ...p, seats: { ...p.seats, [s.studentCode]: { ...p.seats[s.studentCode], status: "Finished" } } } : p));
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export function labelStatus(code: string, labels: Record<string, Label>, sessions: Session[]) {
  if (labels[code]) return labels[code].value === "risk" ? "Risk" : "No Risk";
  return sessions.some((s) => s.studentCode === code) ? "Not labelled" : "No sessions yet";
}
