import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppLayout, EmptyState, Pill } from "@/components/lumen";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers — Lumen admin" },
      { name: "description", content: "Manage teachers, approve requests and assign classes." },
      { property: "og:title", content: "Teachers — Lumen admin" },
      { property: "og:description", content: "Manage teachers, approve requests and assign classes." },
    ],
  }),
  component: TeachersPage,
});

function AddTeacher() {
  const { addStaff } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    addStaff({ name, email, role: "Teacher", classIds: [], status: "Active" });
    toast.success(`${name} added`);
    setOpen(false); setName(""); setEmail("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add teacher</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add teacher</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="at-n">Name</Label><Input id="at-n" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="at-e">Email</Label><Input id="at-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeachersPage() {
  const { staff, classes, updateStaff, removeStaff, log } = useStore();
  return (
    <AppLayout area="admin" title="Teachers" actions={<AddTeacher />}>
      <Card className="overflow-x-auto shadow-soft">
        {staff.length ? (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-navy"><tr>{["Name", "Email", "Role", "Assigned classes", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {staff.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-semibold">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.email}</td>
                  <td className="px-4 py-3">{t.role}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">{t.classIds.length ? t.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id).join(", ") : "Assign classes"}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {classes.map((c) => (
                          <DropdownMenuCheckboxItem key={c.id} checked={t.classIds.includes(c.id)} onSelect={(e) => e.preventDefault()}
                            onCheckedChange={(v) => updateStaff(t.id, { classIds: v ? [...t.classIds, c.id] : t.classIds.filter((x) => x !== c.id) })}>{c.name}</DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-4 py-3"><Pill tone={t.status === "Active" ? "success" : "amber"}>{t.status}</Pill></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {t.status === "Pending" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { removeStaff(t.id); toast.success(`${t.name}'s request denied`); }}>Deny</Button>
                        <Button size="sm" onClick={() => { updateStaff(t.id, { status: "Active" }); log(`${t.name} approved as ${t.role}`); toast.success(`${t.name} approved`); }}>Approve</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="No staff yet" text="Add a teacher to get started." />}
      </Card>
    </AppLayout>
  );
}
