import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { DutyAssignment } from "../../data/types";
import { assignmentTypeLabel, StatusBadge, dutyStatusTone } from "../common/StatusBadge";
import { EmptyState } from "../common/States";

export function UpcomingDuties({ assignments }: { assignments: DutyAssignment[] }) {
  const upcoming = assignments
    .filter((item) => item.status === "SELECTED")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section aria-labelledby="upcoming-duties-heading" className="rounded-lg border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold" id="upcoming-duties-heading">
          Upcoming Exam Duties
        </h2>
        <Link className="text-xs font-medium text-teal-deep hover:underline" to="/assignments">
          View all assignments
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No upcoming exam duties." description="Select an available duty to get started." />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {upcoming.map((assignment) => (
            <li className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4" key={assignment.id}>
              <div className="min-w-[180px] flex-1">
                <p className="text-sm font-medium text-ink">{assignment.examName}</p>
                <p className="text-xs text-muted">
                  {assignment.subjectCode} - {assignment.subjectName}
                </p>
              </div>
              <div className="text-xs text-muted">
                <p className="font-medium text-ink">{assignment.date}</p>
                <p>
                  {assignment.startTime} - {assignment.endTime}
                </p>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin aria-hidden="true" size={13} />
                {assignment.venue}
              </p>
              <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
                {assignmentTypeLabel[assignment.assignmentType]}
              </span>
              <StatusBadge label={assignment.status} tone={dutyStatusTone[assignment.status]} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
