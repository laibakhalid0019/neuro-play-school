import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useStore, type ClassInfo } from "@/lib/store";
import { NativeSelect } from "@/components/lumen";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddStudentDialog({ classes, defaultClassId }: { classes: ClassInfo[]; defaultClassId?: string }) {
  const { addStudent, nextStudentCode } = useStore();
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(defaultClassId ?? classes[0]?.id ?? "");
  const [dob, setDob] = useState("");
  const [year, setYear] = useState("2026/27");
  const [gender, setGender] = useState("");
  const [consent, setConsent] = useState(false);
  useEffect(() => { if (open) { setClassId(defaultClassId ?? classes[0]?.id ?? ""); setDob(""); setGender(""); setConsent(false); } }, [open, defaultClassId, classes]);
  const code = classId ? nextStudentCode(classId) : "";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!consent || !classId) return;
    addStudent({ code, classId, dob, year, gender: gender || undefined, consent });
    toast.success(`Student ${code} added`);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button disabled={!classes.length}>Add student</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add student</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="as-class">Class</Label>
            <NativeSelect id="as-class" className="w-full" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect></div>
          <div className="space-y-1.5"><Label>Student code (auto-generated)</Label><Input value={code} readOnly className="font-mono" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="as-dob">Date of birth</Label><Input id="as-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label htmlFor="as-year">School year</Label><Input id="as-year" value={year} onChange={(e) => setYear(e.target.value)} required /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="as-g">Gender (optional)</Label>
            <NativeSelect id="as-g" className="w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Not specified</option><option>Female</option><option>Male</option><option>Prefer not to say</option>
            </NativeSelect></div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            <span>Guardian consent for taking part in screening has been recorded by the institution</span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!consent}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
