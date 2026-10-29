import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "Admin" | "Teacher" | "Clinician";
export type StaffRole = "Teacher" | "Clinician";
export type LabelValue = "risk" | "norisk";
export type PlayStatus = "Waiting" | "Playing" | "Paused" | "Finished";
export type Readiness = "Ready for training" | "In progress" | "Not ready";

export interface ClassInfo { id: string; name: string }
export interface Staff { id: string; name: string; email: string; role: StaffRole; classIds: string[]; status: "Active" | "Pending" }
export interface Student { code: string; classId: string; dob: string; year: string; gender?: string | undefined; consent: boolean }
export interface Session { id: string; studentCode: string; date: string; minutes: number; accuracy: number; errors: number; rtMs: number }
export interface Label { value: LabelValue; note?: string | undefined; by: string; at: string }
export interface Seat { pc: number; status: PlayStatus; recorded?: boolean | undefined }
export interface Period { classId: string; code: string; lab: string; open: boolean; seats: Record<string, Seat> }
export interface Activity { id: string; text: string; at: string }
export interface User { name: string; email: string; role: Role; institution: string; staffId?: string }
export interface Federation { minor: number; round: number; state: "Up to date" | "Training" | "Waiting for round"; lastRoundAt: string }

export const INSTITUTION = "Riverside Primary School (sample)";
export const INSTITUTION_ID = "LUM-INST-0042";
export const MIN_LABELS = 20;
export const DEMO_CLASS_CODE = "KG1-7K2";
export const DEMO_STUDENT_CODE = "S-KG1-01";

let seed = 11;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
export const pad = (n: number) => String(n).padStart(2, "0");
const today = () => new Date().toISOString().slice(0, 10);

export function makeSession(code: string, date: string, tag: string | number): Session {
  return {
    id: `${code}-${tag}-${Math.round(rnd() * 1e6)}`,
    studentCode: code,
    date,
    minutes: Math.round(12 + rnd() * 12),
    accuracy: Math.round(60 + rnd() * 36),
    errors: Math.round(2 + rnd() * 14),
    rtMs: Math.round(480 + rnd() * 620),
  };
}

const INITIAL_CLASSES: ClassInfo[] = [
  { id: "KG1", name: "KG 1" },
  { id: "KG2", name: "KG 2" },
  { id: "G1", name: "Grade 1" },
];

const INITIAL_STAFF: Staff[] = [
  { id: "t1", name: "Ms. Okafor", email: "okafor@riverside.edu", role: "Teacher", classIds: ["KG1", "KG2"], status: "Active" },
  { id: "t2", name: "Mr. Haddad", email: "haddad@riverside.edu", role: "Teacher", classIds: ["G1"], status: "Active" },
  { id: "t4", name: "Ms. Brennan", email: "brennan@riverside.edu", role: "Teacher", classIds: [], status: "Pending" },
];

export const DEMO_USERS: Record<Role, User> = {
  Admin: { name: "Mr. Adeyemi", email: "admin@riverside.edu", role: "Admin", institution: INSTITUTION },
  Teacher: { name: "Ms. Okafor", email: "okafor@riverside.edu", role: "Teacher", institution: INSTITUTION, staffId: "t1" },
  Clinician: { name: "Dr. Mensah", email: "mensah@riverside.edu", role: "Clinician", institution: INSTITUTION },
};

function seedData() {
  // [size, with sessions, labelled, includeRisk]
  const plan: Record<string, [number, number, number, boolean]> = { KG1: [24, 22, 22, true], KG2: [25, 22, 14, true], G1: [23, 14, 4, false] };
  const students: Student[] = [];
  const sessions: Session[] = [];
  const labels: Record<string, Label> = {};
  for (const c of INITIAL_CLASSES) {
    const [size, played, labelled, withRisk] = plan[c.id] ?? [0, 0, 0, false];
    const birthYear = c.id === "G1" ? 2019 : c.id === "KG2" ? 2020 : 2021;
    for (let i = 1; i <= size; i++) {
      const code = `S-${c.id}-${pad(i)}`;
      students.push({ code, classId: c.id, dob: `${birthYear}-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 27))}`, year: "2026/27", consent: true });
      if (i <= played) {
        sessions.push(makeSession(code, `2026-10-${pad(5 + (i % 12))}`, 1));
        if (i <= labelled) {
          const value: LabelValue = withRisk && i % 4 === 0 ? "risk" : "norisk";
          labels[code] = { value, by: c.id === "G1" ? "Mr. Haddad (Teacher)" : "Ms. Okafor (Teacher)", at: "2026-10-18T10:00:00Z" };
        }
      }
    }
  }
  return { students, sessions, labels };
}

export function readiness(classId: string, students: Student[], sessions: Session[], labels: Record<string, Label>) {
  const codes = students.filter((s) => s.classId === classId).map((s) => s.code);
  const played = codes.filter((c) => sessions.some((s) => s.studentCode === c));
  const sessionCount = sessions.filter((s) => codes.includes(s.studentCode)).length;
  const labelled = codes.filter((c) => labels[c]);
  const hasRisk = labelled.some((c) => labels[c]?.value === "risk");
  const hasNoRisk = labelled.some((c) => labels[c]?.value === "norisk");
  const status: Readiness = labelled.length >= MIN_LABELS && hasRisk && hasNoRisk ? "Ready for training" : labelled.length >= 10 ? "In progress" : "Not ready";
  return { students: codes.length, played: played.length, sessions: sessionCount, labelled: labelled.length, hasRisk, hasNoRisk, status };
}

/** Simple mock model output: probability of "Risk" from a student's sessions. */
export function estimate(list: Session[]) {
  if (!list.length) return null;
  const avg = (k: "accuracy" | "errors" | "rtMs") => list.reduce((a, s) => a + s[k], 0) / list.length;
  const p = 0.3 + (80 - avg("accuracy")) / 50 + (avg("errors") - 8) / 40 + (avg("rtMs") - 780) / 2500;
  const prob = Math.min(0.96, Math.max(0.04, p));
  return { prob, value: prob >= 0.5 ? ("Risk" as const) : ("No Risk" as const) };
}

export function labelStatus(code: string, labels: Record<string, Label>, sessions: Session[]) {
  if (labels[code]) return labels[code].value === "risk" ? "Risk" : "No Risk";
  return sessions.some((s) => s.studentCode === code) ? "Not labelled" : "No sessions yet";
}

interface Store {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  classes: ClassInfo[];
  staff: Staff[];
  students: Student[];
  sessions: Session[];
  labels: Record<string, Label>;
  activity: Activity[];
  federation: Federation;
  featureVectors: number;
  setFeatureVectors: (n: number) => void;
  institutionStatus: "Approved" | "Pending";
  setInstitutionStatus: (s: "Approved" | "Pending") => void;
  myClasses: ClassInfo[];
  addClass: (name: string) => void;
  addStudent: (s: Student) => void;
  nextStudentCode: (classId: string) => string;
  addStaff: (s: Omit<Staff, "id">) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
  setLabel: (code: string, value: LabelValue | null, note?: string) => void;
  period: Period | null;
  startPeriod: (classId: string) => void;
  endPeriod: () => void;
  clearPeriod: () => void;
  recordSession: (s: Omit<Session, "id" | "date">) => void;
  player: { classCode: string; studentCode: string } | null;
  setPlayer: (p: Store["player"]) => void;
  completeRound: () => void;
  log: (text: string) => void;
  reviewFocus: string | null;
  setReviewFocus: (c: string | null) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(seedData, []);
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [students, setStudents] = useState(initial.students);
  const [sessions, setSessions] = useState(initial.sessions);
  const [labels, setLabels] = useState(initial.labels);
  const [period, setPeriod] = useState<Period | null>(null);
  const [player, setPlayer] = useState<Store["player"]>(null);
  const [featureVectors, setFeatureVectors] = useState(initial.sessions.length);
  const [institutionStatus, setInstitutionStatus] = useState<"Approved" | "Pending">("Approved");
  const [reviewFocus, setReviewFocus] = useState<string | null>(null);
  const [federation, setFederation] = useState<Federation>({ minor: 0, round: 6, state: "Up to date", lastRoundAt: "2026-10-17" });
  const [activity, setActivity] = useState<Activity[]>([
    { id: "a1", text: "Ms. Okafor finished a game period in KG 1", at: "2026-10-18 10:40" },
    { id: "a2", text: "12 sessions labelled in KG 2", at: "2026-10-18 09:15" },
    { id: "a3", text: "Global model v1.0 received from the Lumen community", at: "2026-10-17 16:02" },
    { id: "a4", text: "Ms. Brennan requested access", at: "2026-10-16 14:20" },
  ]);

  const log = (text: string) =>
    setActivity((a) => [{ id: `${Date.now()}-${Math.random()}`, text, at: new Date().toISOString().slice(0, 16).replace("T", " ") }, ...a].slice(0, 30));

  // simulate live lab activity
  useEffect(() => {
    if (!period?.open) return;
    const t = setInterval(() => {
      setPeriod((p) => {
        if (!p || !p.open) return p;
        const seats = { ...p.seats };
        for (const code of Object.keys(seats)) {
          if (player?.studentCode === code) continue;
          const s = seats[code];
          if (!s) continue;
          const r = Math.random();
          if (s.status === "Waiting" && r < 0.35) seats[code] = { ...s, status: "Playing" };
          else if (s.status === "Playing" && r < 0.05) seats[code] = { ...s, status: "Paused" };
          else if (s.status === "Playing" && r < 0.14) seats[code] = { ...s, status: "Finished" };
          else if (s.status === "Paused" && r < 0.4) seats[code] = { ...s, status: "Playing" };
        }
        return { ...p, seats };
      });
    }, 1800);
    return () => clearInterval(t);
  }, [period?.open, player?.studentCode]);

  const staffRecord = user?.staffId ? staff.find((s) => s.id === user.staffId) : undefined;
  const myClasses = user?.role === "Admin" ? classes : classes.filter((c) => staffRecord?.classIds.includes(c.id));
  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? id;

  const store: Store = {
    user,
    login: setUser,
    logout: () => setUser(null),
    classes, staff, students, sessions, labels, activity, federation, featureVectors, setFeatureVectors,
    institutionStatus, setInstitutionStatus, myClasses, period, player, setPlayer, log, reviewFocus, setReviewFocus,
    addClass: (name) => {
      const id = name.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || `C${classes.length + 1}`;
      if (classes.some((c) => c.id === id)) return;
      setClasses((c) => [...c, { id, name }]);
      log(`Class ${name} added`);
    },
    addStudent: (s) => { setStudents((x) => [...x, s]); log(`Student ${s.code} added to ${className(s.classId)}`); },
    nextStudentCode: (classId) => {
      const nums = students.filter((s) => s.classId === classId).map((s) => Number(s.code.split("-").pop()) || 0);
      return `S-${classId}-${pad((nums.length ? Math.max(...nums) : 0) + 1)}`;
    },
    addStaff: (s) => { setStaff((x) => [...x, { ...s, id: `t${Date.now()}` }]); log(s.status === "Pending" ? `${s.name} requested access` : `${s.name} added as ${s.role}`); },
    updateStaff: (id, patch) => setStaff((x) => x.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeStaff: (id) => {
      const s = staff.find((x) => x.id === id);
      if (s) log(`${s.name}'s access request denied`);
      setStaff((x) => x.filter((y) => y.id !== id));
    },
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
      setPeriod({ classId, code, lab: "Computer lab", open: true, seats });
      log(`${user?.name ?? "Staff"} opened a game period for ${className(classId)}`);
    },
    endPeriod: () => {
      if (!period) return;
      const finished = Object.entries(period.seats).filter(([, s]) => s.status === "Finished" && !s.recorded).map(([c]) => c);
      setSessions((ss) => [...ss, ...finished.map((c, i) => makeSession(c, today(), `p${ss.length + i}`))]);
      setPeriod({ ...period, open: false });
      log(`${user?.name ?? "Staff"} finished a game period in ${className(period.classId)}`);
    },
    clearPeriod: () => setPeriod(null),
    recordSession: (s) => {
      setSessions((ss) => [...ss, { ...s, id: `${s.studentCode}-${Date.now()}`, date: today() }]);
      setPeriod((p) => {
        if (!p || !p.open) return p;
        const seat = p.seats[s.studentCode];
        if (!seat) return p;
        return { ...p, seats: { ...p.seats, [s.studentCode]: { ...seat, status: "Finished", recorded: true } } };
      });
    },
    completeRound: () => {
      setFederation((f) => ({ minor: f.minor + 1, round: f.round + 1, state: "Up to date", lastRoundAt: today() }));
      log(`FL round ${federation.round + 1} completed · global model v1.${federation.minor + 1} received`);
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}
