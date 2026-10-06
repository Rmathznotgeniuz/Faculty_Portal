import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useClasses, useFacultyDirectory, useStudentsForClass } from "../../services/mockService";

export default function HodClassesPage() {
  const classes = useClasses().filter((item) => item.department === "CSE");
  const faculty = useFacultyDirectory();

  return (
    <div>
      <PageHeader subtitle="Classes in Computer Science & Engineering with advisor assignments." title="Classes" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {classes.map((cls) => {
          const advisor = faculty.find((member) => member.id === cls.advisorId);
          const students = useStudentsForClass(cls.id);
          const averageAttendance =
            students.reduce((sum, student) => sum + student.attendance, 0) / Math.max(students.length, 1);
          return (
            <div className="rounded-lg border border-line bg-surface p-4" key={cls.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">{cls.name}</h2>
                  <p className="text-xs text-muted">
                    Year {cls.year} - Section {cls.section} - {students.length} students
                  </p>
                </div>
                <StatusBadge tone={advisor ? "success" : "warning"}>
                  {advisor ? "Advisor assigned" : "No advisor"}
                </StatusBadge>
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted">Class advisor</dt>
                  <dd className="font-medium">{advisor?.name ?? "Unassigned"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Average attendance</dt>
                  <dd className="font-medium">{averageAttendance.toFixed(1)}%</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
