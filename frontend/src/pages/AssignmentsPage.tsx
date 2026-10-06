import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { EmptyState, PageHeader } from "../components/common/States";
import { assignmentTypeLabel, dutyStatusTone, StatusBadge } from "../components/common/StatusBadge";
import { dutyService } from "../services/portalService";
import type { DutyAssignment } from "../data/types";

type Tab = "upcoming" | "completed" | "cancelled";

const tabs: { id: Tab; label: string; statuses: DutyAssignment["status"][] }[] = [
  { id: "upcoming", label: "Upcoming", statuses: ["SELECTED"] },
  { id: "completed", label: "Completed", statuses: ["COMPLETED"] },
  { id: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
];

export default function AssignmentsPage() {
  const assignments = dutyService.useAssignments();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [sortAsc, setSortAsc] = useState(true);

  const active = tabs.find((item) => item.id === tab)!;
  const rows = useMemo(
    () =>
      assignments
        .filter((item) => active.statuses.includes(item.status))
        .sort((a, b) => (sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))),
    [assignments, active, sortAsc],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader subtitle="Your exam duty assignments across the semester." title="My Assignments" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div aria-label="Filter assignments" className="flex rounded-md border border-line bg-surface p-1" role="tablist">
          {tabs.map((item) => (
            <button
              aria-selected={tab === item.id}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                tab === item.id ? "bg-teal/10 text-teal-deep" : "text-muted hover:text-ink"
              }`}
              key={item.id}
              onClick={() => setTab(item.id)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          className="ml-auto text-xs font-medium text-teal-deep hover:underline"
          onClick={() => setSortAsc((value) => !value)}
          type="button"
        >
          Sort by date {sortAsc ? "ascending" : "descending"}
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={`No ${tab} assignments.`} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="px-5 py-3 font-semibold">Exam</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Venue</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{assignment.examName}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {assignment.subjectCode} - {assignment.subjectName}
                  </td>
                  <td className="px-5 py-3.5">{assignment.date}</td>
                  <td className="px-5 py-3.5">
                    {assignment.startTime} - {assignment.endTime}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-muted">
                      <MapPin aria-hidden="true" size={13} />
                      {assignment.venue}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">
                    {assignmentTypeLabel[assignment.assignmentType]}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge label={assignment.status} tone={dutyStatusTone[assignment.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
