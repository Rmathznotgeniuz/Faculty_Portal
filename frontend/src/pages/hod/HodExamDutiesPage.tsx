import { useMemo, useState } from "react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useAdminDuties } from "../../services/mockService";

const lifecycleTone = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "neutral",
  CANCELLED: "error",
} as const;

export default function HodExamDutiesPage() {
  const duties = useAdminDuties();
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      duties
        .filter((duty) => duty.eligibleDepartments.includes("CSE"))
        .filter((duty) => status === "all" || duty.status === status)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [duties, status],
  );

  return (
    <div>
      <PageHeader subtitle="Exam duties relevant to CSE faculty, with selection windows." title="Exam Duties" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter by status"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="FULL">Full</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Exam</th>
              <th className="px-4 py-2.5 font-medium">Subject</th>
              <th className="px-4 py-2.5 font-medium">Time</th>
              <th className="px-4 py-2.5 font-medium">Venue</th>
              <th className="px-4 py-2.5 font-medium">Assigned</th>
              <th className="px-4 py-2.5 font-medium">Selection window</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((duty) => (
              <tr className="border-t border-line" key={duty.id}>
                <td className="whitespace-nowrap px-4 py-2.5">{duty.date}</td>
                <td className="px-4 py-2.5">{duty.exam}</td>
                <td className="px-4 py-2.5 font-medium">
                  {duty.subjectCode} {duty.subjectName}
                </td>
                <td className="px-4 py-2.5">{duty.time}</td>
                <td className="px-4 py-2.5">{duty.venue}</td>
                <td className="px-4 py-2.5">
                  {duty.assigned}/{duty.capacity}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted">
                  {duty.selectionOpens} to {duty.selectionCloses}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={lifecycleTone[duty.status]}>{duty.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
