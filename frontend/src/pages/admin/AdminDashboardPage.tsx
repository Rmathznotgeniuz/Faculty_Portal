import { Link } from "react-router-dom";
import { ArrowRight, Building2, ClipboardList, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  useAdminDuties,
  useAllocationSummary,
  useClasses,
  useDepartments,
  useFacultyDirectory,
} from "../../services/mockService";

export default function AdminDashboardPage() {
  const departments = useDepartments();
  const faculty = useFacultyDirectory();
  const classes = useClasses();
  const duties = useAdminDuties();
  const allocation = useAllocationSummary();

  const stats = [
    { label: "Departments", value: departments.length, icon: Building2 },
    { label: "Faculty", value: faculty.length, icon: Users },
    { label: "Classes", value: classes.length, icon: GraduationCap },
    { label: "Exam duties", value: duties.length, icon: ClipboardList },
  ];

  return (
    <div>
      <PageHeader subtitle="Institution-wide overview for the current term." title="Admin Dashboard" />
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div className="rounded-lg border border-line bg-surface p-4" key={stat.label}>
            <stat.icon aria-hidden="true" className="text-teal" size={18} />
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold">Allocation status</h2>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-md border border-line p-3">
              <p className="text-[11px] uppercase text-muted">Assigned</p>
              <p className="text-xl font-semibold text-teal-deep">{allocation.assigned}</p>
            </div>
            <div className="flex-1 rounded-md border border-line p-3">
              <p className="text-[11px] uppercase text-muted">Unfulfilled</p>
              <p className="text-xl font-semibold text-coral">{allocation.unfulfilled}</p>
            </div>
          </div>
          <Link className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-deep hover:underline" to="/admin/allocations">
            Run allocation <ArrowRight aria-hidden="true" size={12} />
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold">Duty lifecycle</h2>
          <ul className="mt-3 space-y-2">
            {duties.slice(0, 5).map((duty) => (
              <li className="flex items-center justify-between text-sm" key={duty.id}>
                <span>
                  {duty.subjectCode} - {duty.date}
                </span>
                <StatusBadge tone={duty.status === "OPEN" ? "success" : duty.status === "CANCELLED" ? "error" : "neutral"}>
                  {duty.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
          <Link className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-deep hover:underline" to="/admin/exam-duties">
            Manage duties <ArrowRight aria-hidden="true" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
