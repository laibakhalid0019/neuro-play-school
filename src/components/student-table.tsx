import { Link } from "@tanstack/react-router";
import { EmptyState, LabelChip } from "@/components/lumen";
import { labelStatus, useStore } from "@/lib/store";

export function StudentTable({ classId, showReview }: { classId: string; showReview?: boolean }) {
  const { students, sessions, labels, setReviewFocus } = useStore();
  const list = students.filter((s) => s.classId === classId);
  if (!list.length) return <EmptyState title="No students in this class yet" text="Use Add student to create the first student code." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-navy"><tr>{["Student code", "School year", "Sessions played", "Label", ...(showReview ? [""] : [])].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
        <tbody className="divide-y">
          {list.map((s) => (
            <tr key={s.code}>
              <td className="px-4 py-2.5 font-mono font-semibold">{s.code}</td>
              <td className="px-4 py-2.5">{s.year}</td>
              <td className="px-4 py-2.5">{sessions.filter((x) => x.studentCode === s.code).length}</td>
              <td className="px-4 py-2.5"><LabelChip status={labelStatus(s.code, labels, sessions)} /></td>
              {showReview && <td className="px-4 py-2.5 text-right"><Link to="/review" onClick={() => setReviewFocus(s.code)} className="font-bold text-primary">View</Link></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
