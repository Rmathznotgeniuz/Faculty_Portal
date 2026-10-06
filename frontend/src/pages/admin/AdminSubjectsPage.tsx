import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { useFacultyDirectory, useSubjects } from "../../services/mockService";

export default function AdminSubjectsPage() {
  const subjects = useSubjects();
  const faculty = useFacultyDirectory();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");

  const filtered = useMemo(
    () =>
      subjects
        .filter((subject) => department === "all" || subject.code.startsWith(department))
        .filter(
          (subject) =>
            subject.name.toLowerCase().includes(query.toLowerCase()) ||
            subject.code.toLowerCase().includes(query.toLowerCase()),
        ),
    [subjects, query, department],
  );

  return (
    <div>
      <PageHeader subtitle="Subject catalog with assigned faculty and class mapping." title="Subjects" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 text-muted" size={16} />
          <input
            className="h-9 w-56 rounded-md border border-line bg-surface pl-8 pr-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search code or name"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by department"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setDepartment(event.target.value)}
          value={department}
        >
          <option value="all">All departments</option>
          <option value="CS">CSE</option>
          <option value="EC">ECE</option>
          <option value="ME">ME</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Class</th>
              <th className="px-4 py-2.5 font-medium">Faculty</th>
              <th className="px-4 py-2.5 font-medium">Students</th>
              <th className="px-4 py-2.5 font-medium">Credits</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((subject) => {
              const teacher = faculty.find((member) => member.id === subject.facultyId);
              return (
                <tr className="border-t border-line" key={subject.id}>
                  <td className="px-4 py-2.5 font-mono text-xs">{subject.code}</td>
                  <td className="px-4 py-2.5 font-medium">{subject.name}</td>
                  <td className="px-4 py-2.5">{subject.className}</td>
                  <td className="px-4 py-2.5">{teacher?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-2.5">{subject.studentCount}</td>
                  <td className="px-4 py-2.5">{subject.credits}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
