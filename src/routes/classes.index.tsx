import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LabelChip, NativeSelect, StaffLayout } from "@/components/lumen";
import { CLASSES, labelStatus, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/classes/")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : "4A" }),
  head: () => ({
    meta: [
      { title: "Classes and students — Lumen" },
      { name: "description", content: "Class rosters identified by student code." },
      { property: "og:title", content: "Classes and students — Lumen" },
      { property: "og:description", content: "Class rosters identified by student code." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const { c } = Route.useSearch();
  const nav = useNavigate({ from: "/classes/" });
  const { students, sessions, labels } = useStore();
  const list = students.filter((s) => s.classId === c);
  return (
    <StaffLayout title="Classes and Students" actions={<Button asChild><Link to="/classes/add" search={{ c }}>Add student</Link></Button>}>
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="cls" className="font-semibold">Class</label>
        <NativeSelect id="cls" value={c} onChange={(e) => nav({ search: { c: e.target.value } })}>
          {CLASSES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </NativeSelect>
        <span className="text-sm text-muted-foreground">{list.length} students</span>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Student code</TableHead><TableHead>School year</TableHead><TableHead>Sessions played</TableHead><TableHead>Label</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.code}>
                <TableCell className="font-bold text-navy">{s.code}</TableCell>
                <TableCell>{s.year}</TableCell>
                <TableCell>{sessions.filter((x) => x.studentCode === s.code).length}</TableCell>
                <TableCell><LabelChip status={labelStatus(s.code, labels, sessions)} /></TableCell>
                <TableCell className="text-right"><Link to="/review" search={{ c: s.classId, s: s.code, show: "all" }} className="font-bold text-primary hover:underline">View</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </StaffLayout>
  );
}
