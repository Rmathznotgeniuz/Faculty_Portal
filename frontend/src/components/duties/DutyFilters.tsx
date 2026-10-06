import type { Department, Designation, DutyStatus } from "../../data/types";

export type DutyFilters = {
  date: string;
  department: string;
  designation: string;
  status: string;
};

const departments: (Department | "All")[] = [
  "All",
  "Computer Science",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
];

const designations: (Designation | "All")[] = ["All", "Professor", "Associate Professor", "Assistant Professor"];

const statuses: (DutyStatus | "All")[] = ["All", "AVAILABLE", "SELECTED", "CLOSED"];

const selectClass =
  "h-9 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink focus-visible:outline-2 focus-visible:outline-teal";

export function DutyFilters({
  filters,
  onChange,
}: {
  filters: DutyFilters;
  onChange: (next: DutyFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
      <label className="flex items-center gap-2 text-xs font-medium text-muted">
        Date
        <input
          className={selectClass}
          onChange={(event) => onChange({ ...filters, date: event.target.value })}
          type="date"
          value={filters.date}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted">
        Department
        <select
          className={selectClass}
          onChange={(event) => onChange({ ...filters, department: event.target.value })}
          value={filters.department}
        >
          {departments.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted">
        Eligibility
        <select
          className={selectClass}
          onChange={(event) => onChange({ ...filters, designation: event.target.value })}
          value={filters.designation}
        >
          {designations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted">
        Status
        <select
          className={selectClass}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
          value={filters.status}
        >
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      {(filters.date || filters.department !== "All" || filters.designation !== "All" || filters.status !== "All") && (
        <button
          className="ml-auto text-xs font-medium text-teal-deep hover:underline"
          onClick={() => onChange({ date: "", department: "All", designation: "All", status: "All" })}
          type="button"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
