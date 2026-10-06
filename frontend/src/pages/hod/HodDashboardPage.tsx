import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, GraduationCap, Layers, Users } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useClasses, useFacultyDirectory, useSubjects } from "../../services/mockService";

export default function HodDashboardPage() {
  const faculty = useFacultyDirectory().filter((member) => member.department === "CSE");
  const classes = useClasses().filter((item) => item.department === "CSE");
  const subjects = useSubjects().filter((item) => item.code.startsWith("CS"));
  const totalRequired = faculty.reduce((sum, member) => sum + member.requiredDuties, 0);
  const totalCompleted = faculty.reduce((sum, member) => sum + member.completedDuties, 0);

  const stats = [
    { label: "Faculty", value: faculty.length, icon: Users },
    { label: "Classes", value: classes.length, icon: Layers },
    { label: "Subjects", value: subjects.length, icon: GraduationCap },
    { label: "Duty compliance", value: `${totalCompleted}/${totalRequired}`, icon: ClipboardList },
  ];

  return (
    <div>
      <PageHeader subtitle="Computer Science & Engineering - Odd term 2025-2026." title="HOD Dashboard" />
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
          <h2 className="text-sm font-semibold">Duty obligation progress</h2>
          <div className="mt-3 space-y-3">
            {faculty.slice(0, 6).map((member) => {
              const percent = Math.min((member.completedDuties / Math.max(member.requiredDuties, 1)) * 100, 100);
              return (
                <div key={member.id}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted">
                      {member.completedDuties}/{member.requiredDuties}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-canvas">
                    <div className="h-1.5 rounded-full bg-teal" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-deep hover:underline" to="/hod/faculty">
            View all faculty <ArrowRight aria-hidden="true" size={12} />
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold">Classes and advisors</h2>
          <ul className="mt-3 space-y-2">
            {classes.map((cls) => (
              <li className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm" key={cls.id}>
                <span>{cls.name}</span>
                <StatusBadge tone={cls.advisorId ? "success" : "warning"}>
                  {cls.advisorId ? "Advisor assigned" : "No advisor"}
                </StatusBadge>
              </li>
            ))}
          </ul>
          <Link className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-deep hover:underline" to="/hod/classes">
            Manage classes <ArrowRight aria-hidden="true" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
