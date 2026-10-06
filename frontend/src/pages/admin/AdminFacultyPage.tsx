import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useFacultyDirectory } from "../../services/mockService";
import type { FacultyMember } from "../../mock/types";

export default function AdminFacultyPage() {
  const faculty = useFacultyDirectory();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [editing, setEditing] = useState<FacultyMember | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () =>
      faculty
        .filter((member) => department === "all" || member.department === department)
        .filter(
          (member) =>
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.employeeId.toLowerCase().includes(query.toLowerCase()),
        ),
    [faculty, query, department],
  );

  return (
    <div>
      <PageHeader subtitle="Institution-wide faculty directory with mock management actions." title="Faculty" />
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
          aria-label="Filter by department"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setDepartment(event.target.value)}
          value={department}
        >
          <option value="all">All departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
        <button
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-deep"
          onClick={() => setCreating(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={14} /> Add faculty
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Employee ID</th>
              <th className="px-4 py-2.5 font-medium">Department</th>
              <th className="px-4 py-2.5 font-medium">Designation</th>
              <th className="px-4 py-2.5 font-medium">Duties</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr className="border-t border-line" key={member.id}>
                <td className="px-4 py-2.5 font-medium">{member.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{member.employeeId}</td>
                <td className="px-4 py-2.5">{member.department}</td>
                <td className="px-4 py-2.5">{member.designation}</td>
                <td className="px-4 py-2.5">
                  {member.completedDuties}/{member.requiredDuties}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>{member.status}</StatusBadge>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    className="text-xs font-medium text-teal-deep hover:underline"
                    onClick={() => setEditing(member)}
                    type="button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30" role="dialog" aria-modal="true">
          <button aria-label="Close dialog" className="absolute inset-0" onClick={() => { setCreating(false); setEditing(null); }} type="button" />
          <div className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
            <h2 className="font-serif text-lg font-semibold">{creating ? "Add faculty" : `Edit ${editing?.name}`}</h2>
            <p className="mt-1 text-xs text-muted">
              This is a prototype action; changes are kept in memory only and reset on reload.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs text-muted">Name</span>
                <input
                  className="mt-1 h-9 w-full rounded-md border border-line px-3"
                  defaultValue={editing?.name ?? ""}
                  key={editing?.id ?? "new"}
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Designation</span>
                <select className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue={editing?.designation ?? "Assistant Professor"} key={`${editing?.id ?? "new"}-desig`}>
                  <option>Professor</option>
                  <option>Associate Professor</option>
                  <option>Assistant Professor</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Status</span>
                <select className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue={editing?.status ?? "ACTIVE"} key={`${editing?.id ?? "new"}-status`}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-canvas"
                onClick={() => { setCreating(false); setEditing(null); }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-deep"
                onClick={() => { setCreating(false); setEditing(null); }}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
