import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useFacultyDirectory } from "../../services/mockService";

export default function HodFacultyPage() {
  const all = useFacultyDirectory();
  const [query, setQuery] = useState("");
  const [designation, setDesignation] = useState("all");

  const faculty = useMemo(
    () =>
      all
        .filter((member) => member.department === "CSE")
        .filter((member) => designation === "all" || member.designation === designation)
        .filter(
          (member) =>
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.employeeId.toLowerCase().includes(query.toLowerCase()),
        ),
    [all, query, designation],
  );

  return (
    <div>
      <PageHeader subtitle="Faculty members in Computer Science & Engineering." title="Faculty" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 text-muted" size={16} />
          <input
            className="h-9 w-56 rounded-md border border-line bg-surface pl-8 pr-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or employee ID"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by designation"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setDesignation(event.target.value)}
          value={designation}
        >
          <option value="all">All designations</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Employee ID</th>
              <th className="px-4 py-2.5 font-medium">Designation</th>
              <th className="px-4 py-2.5 font-medium">Subjects</th>
              <th className="px-4 py-2.5 font-medium">Duties</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member) => (
              <tr className="border-t border-line" key={member.id}>
                <td className="px-4 py-2.5 font-medium">{member.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{member.employeeId}</td>
                <td className="px-4 py-2.5">{member.designation}</td>
                <td className="px-4 py-2.5 text-xs">{member.subjectCodes.join(", ")}</td>
                <td className="px-4 py-2.5">
                  {member.completedDuties}/{member.requiredDuties}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>{member.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
