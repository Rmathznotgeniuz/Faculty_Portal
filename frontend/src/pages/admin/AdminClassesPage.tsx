import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useClasses, useFacultyDirectory, useStudentsForClass } from "../../services/mockService";

export default function AdminClassesPage() {
  const classes = useClasses();
  const faculty = useFacultyDirectory();

  return (
    <div>
      <PageHeader subtitle="All classes across departments with advisor assignments." title="Classes" />
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Class</th>
              <th className="px-4 py-2.5 font-medium">Department</th>
              <th className="px-4 py-2.5 font-medium">Year</th>
              <th className="px-4 py-2.5 font-medium">Section</th>
              <th className="px-4 py-2.5 font-medium">Students</th>
              <th className="px-4 py-2.5 font-medium">Advisor</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => {
              const advisor = faculty.find((member) => member.id === cls.advisorId);
              return (
                <tr className="border-t border-line" key={cls.id}>
                  <td className="px-4 py-2.5 font-medium">{cls.name}</td>
                  <td className="px-4 py-2.5">{cls.department}</td>
                  <td className="px-4 py-2.5">{cls.year}</td>
                  <td className="px-4 py-2.5">{cls.section}</td>
                  <td className="px-4 py-2.5">{useStudentsForClass(cls.id).length}</td>
                  <td className="px-4 py-2.5">{advisor?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={advisor ? "success" : "warning"}>
                      {advisor ? "Assigned" : "Pending"}
                    </StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
