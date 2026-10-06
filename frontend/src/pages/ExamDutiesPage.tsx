import { useMemo, useState } from "react";
import { DutyCard } from "../components/duties/DutyCard";
import { DutyFilters, type DutyFilters as DutyFiltersState } from "../components/duties/DutyFilters";
import { DutySelectionDialog } from "../components/duties/DutySelectionDialog";
import { EmptyState, PageHeader } from "../components/common/States";
import { dutyService, facultyService } from "../services/portalService";
import type { ExamDuty } from "../data/types";

export default function ExamDutiesPage() {
  const duties = dutyService.useDuties();
  const faculty = facultyService.getFaculty();
  const [filters, setFilters] = useState<DutyFiltersState>({
    date: "",
    department: "All",
    designation: "All",
    status: "All",
  });
  const [detailDuty, setDetailDuty] = useState<ExamDuty | null>(null);
  const [confirmDuty, setConfirmDuty] = useState<ExamDuty | null>(null);

  const filtered = useMemo(
    () =>
      duties.filter((duty) => {
        if (filters.date && duty.date !== filters.date) return false;
        if (filters.department !== "All" && duty.department !== filters.department) return false;
        if (filters.designation !== "All" && !duty.eligibleDesignations.includes(filters.designation as never))
          return false;
        if (filters.status !== "All" && duty.status !== filters.status) return false;
        return true;
      }),
    [duties, filters],
  );

  async function handleConfirm(duty: ExamDuty) {
    try {
      await dutyService.selectDuty(duty.id);
    } catch {
      // The API response is reflected by the next data refresh in the production flow.
    }
    setConfirmDuty(null);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        subtitle="Selections are validated by the exam office before confirmation."
        title="Exam Duties"
      />
      <DutyFilters filters={filters} onChange={setFilters} />
      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState
            title="No duties match your filters."
            description="Try clearing filters or check back later for newly published duties."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((duty) => (
              <DutyCard
                duty={duty}
                key={duty.id}
                onOpen={setDetailDuty}
                onSelect={setConfirmDuty}
              />
            ))}
          </div>
        )}
      </div>

      {detailDuty && (
        <div
          aria-labelledby="duty-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
          role="dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDetailDuty(null);
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-xl">
            <h2 className="font-serif text-lg font-medium" id="duty-detail-title">
              {detailDuty.examName}
            </h2>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subject</dt>
                <dd className="text-right font-medium">
                  {detailDuty.subjectCode} - {detailDuty.subjectName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Date and time</dt>
                <dd className="text-right font-medium">
                  {detailDuty.date}, {detailDuty.startTime} - {detailDuty.endTime}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Venue</dt>
                <dd className="text-right font-medium">{detailDuty.venue}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Capacity</dt>
                <dd className="text-right font-medium">
                  {detailDuty.filledSeats} of {detailDuty.totalSeats} filled
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Eligibility</dt>
                <dd className="text-right font-medium">{detailDuty.eligibleDesignations.join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Selection deadline</dt>
                <dd className="text-right font-medium">{detailDuty.selectionDeadline}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-muted">
              Displayed capacity and eligibility are indicative. Final validation is performed by the
              exam office.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
                onClick={() => setDetailDuty(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DutySelectionDialog
        duty={confirmDuty}
        onClose={() => setConfirmDuty(null)}
        onConfirm={handleConfirm}
      />
      <span className="sr-only">Signed in as {faculty.name}</span>
    </div>
  );
}
