import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { NativeSelect, StaffLayout } from "@/components/lumen";
import { CLASSES, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/classes/add")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : "4A" }),
  head: () => ({
    meta: [
      { title: "Add student — Lumen" },
      { name: "description", content: "Add a student to a class roster by code." },
      { property: "og:title", content: "Add student — Lumen" },
      { property: "og:description", content: "Add a student to a class roster by code." },
    ],
  }),
  component: AddStudent,
});

function AddStudent() {
  const { c } = Route.useSearch();
  const { students, addStudent } = useStore();
  const nav = useNavigate();
  const [classId, setClassId] = useState(c);
  const next = students.filter((s) => s.classId === classId).length + 1;
  const [code, setCode] = useState("");
  const [dob, setDob] = useState("");
  const [year, setYear] = useState(CLASSES.find((x) => x.id === c)?.year ?? "Year 4");
  const [gender, setGender] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const finalCode = code.trim() || `S-${classId}-${String(next).padStart(2, "0")}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (students.some((s) => s.code === finalCode)) return setErr("This student code is already in use.");
    if (!consent) return setErr("Guardian consent must be recorded before adding a student.");
    addStudent({ code: finalCode, classId, dob, year, gender: gender || undefined, consent });
    nav({ to: "/classes", search: { c: classId } });
  };

  return (
    <StaffLayout title="Add student">
      <Card className="max-w-2xl p-8">
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="cl">Class</Label>
            <NativeSelect id="cl" className="w-full" value={classId} onChange={(e) => { setClassId(e.target.value); setYear(CLASSES.find((x) => x.id === e.target.value)!.year); }}>
              {CLASSES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-1.5"><Label htmlFor="code">Student code</Label><Input id="code" placeholder={finalCode} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
          <div className="space-y-1.5"><Label htmlFor="dob">Date of birth</Label><Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="yr">School year</Label>
            <NativeSelect id="yr" className="w-full" value={year} onChange={(e) => setYear(e.target.value)}>
              {["Year 3", "Year 4", "Year 5", "Year 6"].map((y) => <option key={y}>{y}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="g">Gender (optional)</Label>
            <NativeSelect id="g" className="w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Not specified</option><option>Girl</option><option>Boy</option><option>Prefer not to say</option>
            </NativeSelect>
          </div>
          <label className="flex items-start gap-3 rounded-lg bg-secondary p-4 sm:col-span-2">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
            <span className="text-sm font-semibold">Guardian consent for taking part in screening has been recorded by the institution</span>
          </label>
          {err && <p className="text-sm font-semibold text-destructive sm:col-span-2">{err}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button asChild variant="outline"><Link to="/classes" search={{ c: classId }}>Cancel</Link></Button>
            <Button type="submit">Save student</Button>
          </div>
        </form>
      </Card>
    </StaffLayout>
  );
}
