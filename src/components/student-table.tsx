import { Link } from "@tanstack/react-router";
import { EmptyState, LabelChip } from "@/components/lumen";
import { labelStatus, useStore } from "@/lib/store";

export function StudentTable({ classId, showReview, showReport }: { classId: string; showReview?: boolean; showReport?: boolean }) {
  const { students, sessions, labels, setReviewFocus } = useStore();
  const list = students.filter((s) => s.classId === classId);
  if (!list.length) return <EmptyState title="No students in this class yet" text="Use Add student to create the first student code." />;
  const cols = ["Student code", "School year", "Sessions played", "Label"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            {cols.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
            {(showReview || showReport) && <th aria-label="Actions" className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y">
          {list.map((s) => (
            <tr key={s.code}>
              <td className="px-4 py-2.5 font-medium">{s.code}</td>
              <td className="px-4 py-2.5">{s.year}</td>
              <td className="px-4 py-2.5">{sessions.filter((x) => x.studentCode === s.code).length}</td>
              <td className="px-4 py-2.5"><LabelChip status={labelStatus(s.code, labels, sessions)} /></td>
              {(showReview || showReport) && (
                <td className="px-4 py-2.5 text-right">
                  {showReport && <Link to="/reports/$code" params={{ code: s.code }} className="font-semibold text-teal hover:underline">View report</Link>}
                  {showReport && showReview && <span className="mx-2 text-border" aria-hidden>|</span>}
                  {showReview && <Link to="/review" onClick={() => setReviewFocus(s.code)} className="font-semibold text-teal hover:underline">View</Link>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
