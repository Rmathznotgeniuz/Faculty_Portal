import { PageHeader } from "../../components/common/States";
import { useClasses, useDepartments, useFacultyDirectory } from "../../services/mockService";

export default function AdminDepartmentsPage() {
  const departments = useDepartments();
  const faculty = useFacultyDirectory();
  const classes = useClasses();

  return (
    <div>
      <PageHeader subtitle="All departments with heads, staffing, and class counts." title="Departments" />
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">HOD</th>
              <th className="px-4 py-2.5 font-medium">Faculty</th>
              <th className="px-4 py-2.5 font-medium">Classes</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr className="border-t border-line" key={dept.id}>
                <td className="px-4 py-2.5 font-mono text-xs">{dept.code}</td>
                <td className="px-4 py-2.5 font-medium">{dept.name}</td>
                <td className="px-4 py-2.5">{dept.hodName}</td>
                <td className="px-4 py-2.5">{faculty.filter((member) => member.department === dept.code).length}</td>
                <td className="px-4 py-2.5">{classes.filter((cls) => cls.department === dept.code).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
