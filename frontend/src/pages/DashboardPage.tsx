import { Link } from "react-router-dom";
import { CalendarCheck, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { DutyProgress } from "../components/dashboard/DutyProgress";
import { NotificationPreview } from "../components/dashboard/NotificationPreview";
import { PerformanceOverview } from "../components/dashboard/PerformanceOverview";
import { SubjectOverview } from "../components/dashboard/SubjectOverview";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { UpcomingDuties } from "../components/dashboard/UpcomingDuties";
import { useCurrentUser, useDutyHistory, useFacultyTeachingSubjects } from "../services/mockService";
import { dutyService, facultyService } from "../services/portalService";

export default function DashboardPage() {
  const faculty = facultyService.getFaculty();
  const term = facultyService.getAcademicTerm();
  const assignments = dutyService.useAssignments();
  const user = useCurrentUser();
  const teachingSubjects = useFacultyTeachingSubjects(user.facultyId ?? "");
  const dutyHistory = useDutyHistory(user.facultyId ?? "");

  const required = 6;
  const completed = assignments.filter((item) => item.status === "COMPLETED").length;
  const selected = assignments.filter((item) => item.status === "SELECTED").length;
  const remaining = Math.max(0, required - completed - selected);
  const upcoming = assignments.filter((item) => item.status === "SELECTED").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl">
            {greeting}, {faculty.name}
          </h1>
          <p className="mt-1 text-sm text-muted">Here's your academic and exam-duty overview.</p>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
          {term.academicYear} - {term.semester}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          context="For the current semester"
          icon={<ClipboardList aria-hidden="true" size={16} />}
          label="Required Duties"
          value={required}
        />
        <SummaryCard
          context="Selected or completed"
          icon={<CheckCircle2 aria-hidden="true" size={16} />}
          label="Selected / Completed"
          value={completed + selected}
        />
        <SummaryCard
          context="Still to be fulfilled"
          icon={<Clock aria-hidden="true" size={16} />}
          label="Remaining Duties"
          value={remaining}
        />
        <SummaryCard
          context="Scheduled ahead"
          icon={<CalendarCheck aria-hidden="true" size={16} />}
          label="Upcoming Duties"
          value={upcoming}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section aria-labelledby="duty-overview-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold" id="duty-overview-heading">
                Exam Duty Overview
              </h2>
              <Link
                className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-teal"
                to="/exam-duties"
              >
                View Available Duties
              </Link>
            </div>
            <div className="mt-5">
              <DutyProgress completed={completed + selected} required={required} />
            </div>
          </section>
          <UpcomingDuties assignments={assignments} />
          <section aria-labelledby="teaching-snapshot-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold" id="teaching-snapshot-heading">
                Teaching Snapshot
              </h2>
              <Link className="text-xs font-medium text-teal-deep hover:underline" to="/students">
                My Students
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {teachingSubjects.map((subject) => (
                <li className="flex items-center justify-between gap-4 py-2.5" key={subject.id}>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {subject.code} - {subject.name}
                    </p>
                    <p className="text-xs text-muted">{subject.className}</p>
                  </div>
                  <span className="text-xs text-muted">{subject.studentCount} students</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="recent-history-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold" id="recent-history-heading">
                Recent Duty History
              </h2>
              <Link className="text-xs font-medium text-teal-deep hover:underline" to="/duty-history">
                Full history
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {dutyHistory.slice(0, 4).map((record) => (
                <li className="flex items-center justify-between gap-4 py-2.5" key={record.id}>
                  <div>
                    <p className="text-sm font-medium text-ink">{record.subject}</p>
                    <p className="text-xs text-muted">
                      {record.date} - {record.className}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{record.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="space-y-6">
          <NotificationPreview />
          <SubjectOverview />
          <PerformanceOverview />
        </div>
      </div>
    </div>
  );
}
