import { useState } from "react";
import { Users } from "lucide-react";
import { EmptyState, PageHeader } from "../components/common/States";
import { facultyService } from "../services/portalService";
import { mockPerformance } from "../data/mockPerformance";
import type { Subject } from "../data/types";

export default function SubjectsPage() {
  const subjects = facultyService.getSubjects();
  const [selected, setSelected] = useState<Subject | null>(null);

  const statsFor = (subject: Subject) =>
    mockPerformance.find((item) => item.subjectCode === subject.code);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader subtitle="Subjects assigned to you for the current academic year." title="Subjects" />
      {subjects.length === 0 ? (
        <EmptyState title="No subjects assigned." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <article className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-sm" key={subject.id}>
              <p className="text-xs font-semibold uppercase text-teal">{subject.code}</p>
              <h2 className="mt-1 text-sm font-semibold text-ink">{subject.name}</h2>
              <p className="mt-0.5 text-xs text-muted">{subject.className}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted">Academic year</dt>
                  <dd className="font-medium text-ink">{subject.academicYear}</dd>
                </div>
                <div>
                  <dt className="text-muted">Semester</dt>
                  <dd className="font-medium text-ink">{subject.semester}</dd>
                </div>
                <div>
                  <dt className="text-muted">Students</dt>
                  <dd className="flex items-center gap-1 font-medium text-ink">
                    <Users aria-hidden="true" size={13} />
                    {subject.studentCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Your role</dt>
                  <dd className="font-medium text-ink">{subject.facultyRole}</dd>
                </div>
              </dl>
              {statsFor(subject) && (
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-xs">
                  {[
                    { label: "Avg", value: `${statsFor(subject)!.averageMarks}%` },
                    { label: "Pass", value: `${statsFor(subject)!.passPercentage}%` },
                    { label: "Attend", value: `${statsFor(subject)!.attendancePercentage}%` },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-muted">{stat.label}</p>
                      <p className="font-medium text-ink">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 border-t border-line pt-4">
                <button
                  className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
                  onClick={() => setSelected(subject)}
                  type="button"
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div
          aria-labelledby="subject-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
          role="dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-xl">
            <h2 className="font-serif text-lg font-medium" id="subject-detail-title">
              {selected.code} - {selected.name}
            </h2>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Class</dt>
                <dd className="text-right font-medium">{selected.className}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Academic year</dt>
                <dd className="text-right font-medium">
                  {selected.academicYear} ({selected.semester} semester)
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Students enrolled</dt>
                <dd className="text-right font-medium">{selected.studentCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Your role</dt>
                <dd className="text-right font-medium">{selected.facultyRole}</dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
                onClick={() => setSelected(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
