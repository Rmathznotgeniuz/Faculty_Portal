import { useEffect } from "react";
import type { ExamDuty } from "../../data/types";
import { dutyStatusTone, StatusBadge } from "../common/StatusBadge";

export function DutySelectionDialog({
  duty,
  onConfirm,
  onClose,
}: {
  duty: ExamDuty | null;
  onConfirm: (duty: ExamDuty) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (duty) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [duty, onClose]);

  if (!duty) {
    return null;
  }

  return (
    <div
      aria-labelledby="duty-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-xl">
        <h2 className="font-serif text-lg font-medium text-ink" id="duty-dialog-title">
          Confirm duty selection
        </h2>
        <dl className="mt-4 space-y-2 rounded-md border border-line bg-canvas p-4 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Exam</dt>
            <dd className="text-right font-medium">{duty.examName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subject</dt>
            <dd className="text-right font-medium">
              {duty.subjectCode} - {duty.subjectName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date and time</dt>
            <dd className="text-right font-medium">
              {duty.date}, {duty.startTime} - {duty.endTime}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Venue</dt>
            <dd className="text-right font-medium">{duty.venue}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Status</dt>
            <dd>
              <StatusBadge label={duty.status} tone={dutyStatusTone[duty.status]} />
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">
          Your selection is a request only. Eligibility, capacity, workload quota, and schedule
          conflicts are validated by the exam office before the assignment is confirmed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-teal"
            onClick={() => onConfirm(duty)}
            type="button"
          >
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  );
}
