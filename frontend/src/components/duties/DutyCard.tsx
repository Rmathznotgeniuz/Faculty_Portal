import type { ExamDuty } from "../../data/types";
import { dutyStatusTone, StatusBadge } from "../common/StatusBadge";

export function DutyCard({
  duty,
  onOpen,
  onSelect,
}: {
  duty: ExamDuty;
  onOpen: (duty: ExamDuty) => void;
  onSelect: (duty: ExamDuty) => void;
}) {
  const seatsRemaining = Math.max(0, duty.totalSeats - duty.filledSeats);
  const selectable = duty.status === "AVAILABLE" && seatsRemaining > 0;

  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{duty.examName}</p>
          <p className="mt-0.5 text-xs text-muted">
            {duty.subjectCode} - {duty.subjectName}
          </p>
        </div>
        <StatusBadge label={duty.status} tone={dutyStatusTone[duty.status]} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-medium text-ink">{duty.date}</dd>
        </div>
        <div>
          <dt className="text-muted">Time</dt>
          <dd className="font-medium text-ink">
            {duty.startTime} - {duty.endTime}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Venue</dt>
          <dd className="font-medium text-ink">{duty.venue}</dd>
        </div>
        <div>
          <dt className="text-muted">Seats remaining</dt>
          <dd className="font-medium text-ink">
            {seatsRemaining} of {duty.totalSeats}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Eligibility</dt>
          <dd className="font-medium text-ink">{duty.eligibleDesignations.join(", ")}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Selection deadline</dt>
          <dd className="font-medium text-ink">{duty.selectionDeadline}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
        <button
          className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
          onClick={() => onOpen(duty)}
          type="button"
        >
          View details
        </button>
        <button
          className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-teal disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!selectable}
          onClick={() => onSelect(duty)}
          type="button"
        >
          Select Duty
        </button>
      </div>
    </article>
  );
}
