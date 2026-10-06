import { Download } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { useAllocationSummary, useClasses, useFacultyDirectory } from "../../services/mockService";

const reports = [
  { id: "rpt-institution-duty", title: "Institution duty compliance", description: "Completed vs required duties across all departments." },
  { id: "rpt-allocation", title: "Allocation outcomes", description: "Auto and manual assignment results per duty." },
  { id: "rpt-advisor", title: "Advisor coverage", description: "Advisor assignment status for every class." },
  { id: "rpt-audit", title: "Audit extract", description: "Full audit trail for the current term." },
];

export default function AdminReportsPage() {
  const faculty = useFacultyDirectory();
  const classes = useClasses();
  const allocation = useAllocationSummary();

  return (
    <div>
      <PageHeader subtitle="Institution-wide reports with mock export actions." title="Reports" />
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
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Faculty</dt>
            <dd className="font-semibold">{faculty.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Classes</dt>
            <dd className="font-semibold">{classes.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Duties assigned</dt>
            <dd className="font-semibold">{allocation.assigned}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Unfulfilled</dt>
            <dd className="font-semibold text-coral">{allocation.unfulfilled}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
