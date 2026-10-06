import { useMemo, useState } from "react";
import { AlertTriangle, Info, Users } from "lucide-react";
import { EmptyState, PageHeader } from "../components/common/States";
import { StatusBadge } from "../components/common/StatusBadge";
import { facultyService } from "../services/portalService";
import { useClasses, useCurrentUser, useStudentResults, useStudentsForClass } from "../services/mockService";
import type { StudentRecord } from "../mock/types";

type RiskFilter = "all" | "excellent" | "average" | "at-risk" | "low-attendance" | "failed";

function riskOf(student: StudentRecord, average: number, failed: boolean) {
  if (failed) return { label: "Failed", tone: "error" as const, key: "failed" as const };
  if (student.attendance < 75)
    return { label: "Low attendance", tone: "warning" as const, key: "low-attendance" as const };
  if (average >= 75) return { label: "Excellent", tone: "success" as const, key: "excellent" as const };
  if (average >= 55) return { label: "Average", tone: "info" as const, key: "average" as const };
  return { label: "At risk", tone: "warning" as const, key: "at-risk" as const };
}

export default function ClassAdvisorPage() {
  const summary = facultyService.getAdvisorSummary();
  const user = useCurrentUser();
  const classes = useClasses();
  const [filter, setFilter] = useState<RiskFilter>("all");

  const classId = useMemo(
    () => classes.find((cls) => cls.name === summary?.className && cls.advisorId === user.facultyId)?.id,
    [classes, summary, user.facultyId],
  );

  const roster = useMemo(() => {
    if (!summary || !classId) return [];
    const students = useStudentsForClass(classId);
    return students.map((student) => {
      const results = useStudentResults(
        student,
        summary.subjects.map((subject) => ({
          code: subject.code,
          name: subject.name,
          facultyName: subject.faculty,
        })),
      );
      const average = results.reduce((sum, result) => sum + result.total, 0) / Math.max(results.length, 1);
      const failed = results.some((result) => result.grade === "F");
      return { student, average, failed, risk: riskOf(student, average, failed) };
    });
  }, [summary, classId]);

  const filtered = roster.filter((entry) => filter === "all" || entry.risk.key === filter);
  const needingAttention = roster.filter(
    (entry) => entry.risk.key === "failed" || entry.risk.key === "low-attendance" || entry.risk.key === "at-risk",
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader subtitle="Overview of your assigned advisor class." title="Class Advisor" />
      {!summary ? (
        <EmptyState
          title="You are not currently assigned as a class advisor."
          description="Contact the department office if you believe this is an error."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-muted">Assigned class</p>
              <p className="mt-2 font-serif text-xl font-medium text-ink">{summary.className}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-muted">Students</p>
              <p className="mt-2 flex items-center gap-2 font-serif text-xl font-medium text-ink">
                <Users aria-hidden="true" size={18} className="text-teal-deep" />
                {summary.studentCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-muted">Average attendance</p>
              <p className="mt-2 font-serif text-xl font-medium text-ink">{summary.averageAttendance}%</p>
              <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-lime" style={{ width: `${summary.averageAttendance}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section aria-labelledby="advisor-subjects-heading" className="rounded-lg border border-line bg-surface shadow-sm">
              <h2 className="border-b border-line px-5 py-4 text-sm font-semibold" id="advisor-subjects-heading">
                Subjects
              </h2>
              <ul className="divide-y divide-line">
                {summary.subjects.map((subject) => (
                  <li className="flex items-center justify-between gap-4 px-5 py-3.5" key={subject.code}>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {subject.code} - {subject.name}
                      </p>
                      <p className="text-xs text-muted">{subject.faculty}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="advisor-alerts-heading" className="rounded-lg border border-line bg-surface shadow-sm">
              <h2 className="border-b border-line px-5 py-4 text-sm font-semibold" id="advisor-alerts-heading">
                Alerts
              </h2>
              <ul className="divide-y divide-line">
                {summary.alerts.map((alert) => (
                  <li className="flex items-start gap-3 px-5 py-3.5" key={alert.id}>
                    {alert.severity === "warning" ? (
                      <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-coral" size={16} />
                    ) : (
                      <Info aria-hidden="true" className="mt-0.5 shrink-0 text-teal-deep" size={16} />
                    )}
                    <p className="text-sm text-ink">{alert.message}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="advisor-roster-heading" className="mt-6 rounded-lg border border-line bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold" id="advisor-roster-heading">
                Student Roster
              </h2>
              <select
                aria-label="Filter students by status"
                className="h-8 rounded-md border border-line bg-surface px-2 text-xs"
                onChange={(event) => setFilter(event.target.value as RiskFilter)}
                value={filter}
              >
                <option value="all">All students</option>
                <option value="excellent">Excellent</option>
                <option value="average">Average</option>
                <option value="at-risk">At risk</option>
                <option value="low-attendance">Low attendance</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas text-xs text-muted">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Register No.</th>
                    <th className="px-5 py-2.5 font-medium">Name</th>
                    <th className="px-5 py-2.5 font-medium">Attendance</th>
                    <th className="px-5 py-2.5 font-medium">Average</th>
                    <th className="px-5 py-2.5 font-medium">Subjects failed</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ student, average, failed, risk }) => (
                    <tr className="border-t border-line" key={student.id}>
                      <td className="px-5 py-2.5 font-mono text-xs">{student.registerNumber}</td>
                      <td className="px-5 py-2.5 font-medium">{student.name}</td>
                      <td className="px-5 py-2.5">{student.attendance.toFixed(0)}%</td>
                      <td className="px-5 py-2.5">{average.toFixed(1)}</td>
                      <td className="px-5 py-2.5">{failed ? "Yes" : "No"}</td>
                      <td className="px-5 py-2.5">
                        <StatusBadge tone={risk.tone}>{risk.label}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {needingAttention.length > 0 && (
            <section aria-labelledby="advisor-attention-heading" className="mt-6 rounded-lg border border-coral/30 bg-coral-soft/40 p-5">
              <h2 className="text-sm font-semibold" id="advisor-attention-heading">
                Students Needing Attention
              </h2>
              <ul className="mt-3 space-y-2">
                {needingAttention.map(({ student, risk }) => (
                  <li className="flex items-center justify-between gap-4 text-sm" key={student.id}>
                    <span>
                      {student.name} <span className="text-xs text-muted">({student.registerNumber})</span>
                    </span>
                    <StatusBadge tone={risk.tone}>{risk.label}</StatusBadge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
