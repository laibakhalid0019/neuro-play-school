import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, NativeSelect } from "@/components/lumen";
import { AddStudentDialog } from "@/components/add-student-dialog";
import { StudentTable } from "@/components/student-table";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Lumen" },
      { name: "description", content: "Class rosters by student code with sessions played and label status." },
      { property: "og:title", content: "Classes — Lumen" },
      { property: "og:description", content: "Class rosters by student code with sessions played and label status." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const { myClasses } = useStore();
  const [sel, setSel] = useState("");
  const classId = myClasses.some((c) => c.id === sel) ? sel : myClasses[0]?.id ?? "";
  return (
    <AppLayout area="staff" title="Classes"
      actions={<>
        {myClasses.length > 0 && <NativeSelect aria-label="Class" value={classId} onChange={(e) => setSel(e.target.value)}>{myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect>}
        <AddStudentDialog classes={myClasses} defaultClassId={classId} />
      </>}>
      {classId ? <Card className="shadow-soft"><StudentTable classId={classId} showReview /></Card> : <EmptyState title="No classes assigned" text="Ask your institution admin to assign you a class." />}
    </AppLayout>
  );
}
