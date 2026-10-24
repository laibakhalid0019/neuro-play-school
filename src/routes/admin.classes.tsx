import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, EmptyState } from "@/components/lumen";
import { AddStudentDialog } from "@/components/add-student-dialog";
import { StudentTable } from "@/components/student-table";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/classes")({
  head: () => ({
    meta: [
      { title: "Classes and Students — Lumen admin" },
      { name: "description", content: "Classes, assigned staff and student rosters identified by code." },
      { property: "og:title", content: "Classes and Students — Lumen admin" },
      { property: "og:description", content: "Classes, assigned staff and student rosters identified by code." },
    ],
  }),
  component: ClassesAdmin,
});

function AddClass() {
  const { addClass } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const submit = (e: FormEvent) => { e.preventDefault(); addClass(name.trim()); toast.success(`${name} added`); setName(""); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Add class</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add class</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="ac-n">Class name</Label><Input id="ac-n" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grade 2" required /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClassesAdmin() {
  const { classes, students, staff, labels } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const current = classes.find((c) => c.id === open);
  return (
    <AppLayout area="admin" title={current ? current.name : "Classes and Students"}
      actions={<>{!current && <AddClass />}<AddStudentDialog classes={classes} defaultClassId={current?.id} /></>}>
      {current ? (
        <Card className="shadow-soft">
          <div className="p-4"><Button variant="ghost" size="sm" onClick={() => setOpen(null)}><ArrowLeft className="h-4 w-4" />All classes</Button></div>
          <StudentTable classId={current.id} />
        </Card>
      ) : classes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const cs = students.filter((s) => s.classId === c.id);
            const l = cs.filter((s) => labels[s.code]).length;
            const assigned = staff.filter((t) => t.classIds.includes(c.id)).map((t) => t.name);
            return (
              <Card key={c.id} className="space-y-3 p-6 shadow-soft">
                <h2 className="text-xl font-extrabold text-navy">{c.name}</h2>
                <p className="text-sm"><span className="font-bold">{cs.length}</span> students</p>
                <p className="text-sm text-muted-foreground">Staff: {assigned.length ? assigned.join(", ") : "None assigned"}</p>
                <div><div className="mb-1 flex justify-between text-xs font-semibold"><span>Labelled</span><span>{l} of {cs.length}</span></div><Progress value={cs.length ? (l / cs.length) * 100 : 0} className="h-2" /></div>
                <Button className="w-full" variant="outline" onClick={() => setOpen(c.id)}>Open class</Button>
              </Card>
            );
          })}
        </div>
      ) : <EmptyState title="No classes yet" text="Add your first class." />}
    </AppLayout>
  );
}
