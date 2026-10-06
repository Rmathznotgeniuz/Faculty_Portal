import { Download } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { useClasses, useFacultyDirectory, useStudentsForClass } from "../../services/mockService";

const reports = [
  { id: "rpt-duty", title: "Exam duty compliance", description: "Completed vs required duties per faculty member." },
  { id: "rpt-advisor", title: "Class advisor coverage", description: "Advisor assignment status for every class." },
  { id: "rpt-attendance", title: "Attendance summary", description: "Average attendance across department classes." },
  { id: "rpt-workload", title: "Teaching workload", description: "Subjects handled per faculty member." },
];

export default function HodReportsPage() {
  const faculty = useFacultyDirectory().filter((member) => member.department === "CSE");
  const classes = useClasses().filter((item) => item.department === "CSE");
  const averageAttendance =
    classes.reduce(
      (sum, cls) =>
        sum + useStudentsForClass(cls.id).reduce((inner, student) => inner + student.attendance, 0) / Math.max(useStudentsForClass(cls.id).length, 1),
      0,
    ) / Math.max(classes.length, 1);

  return (
    <div>
      <PageHeader subtitle="Downloadable department reports for the current term." title="Reports" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <div className="rounded-lg border border-line bg-surface p-4" key={report.id}>
            <h2 className="text-sm font-semibold">{report.title}</h2>
            <p className="mt-1 text-xs text-muted">{report.description}</p>
            <button
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
              type="button"
            >
              <Download aria-hidden="true" size={14} /> Export CSV
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Snapshot</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Faculty</dt>
            <dd className="font-semibold">{faculty.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Classes</dt>
            <dd className="font-semibold">{classes.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Average attendance</dt>
            <dd className="font-semibold">{averageAttendance.toFixed(1)}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
