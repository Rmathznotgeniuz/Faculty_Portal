import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../components/common/States";
import { StatusBadge } from "../components/common/StatusBadge";
import { useCurrentUser, useDutyHistory } from "../services/mockService";
import type { DutyHistoryRecord } from "../mock/types";

const typeLabels: Record<DutyHistoryRecord["assignmentType"], string> = {
  SELF_SELECTED: "Self-selected",
  AUTO_ASSIGNED: "Auto-assigned",
  ADMIN_ASSIGNED: "Admin-assigned",
};

export default function DutyHistoryPage() {
  const user = useCurrentUser();
  const history = useDutyHistory(user.facultyId ?? "");
  const [semester, setSemester] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const completed = history.filter((record) => record.status === "COMPLETED").length;
  const upcoming = history.filter((record) => record.status === "UPCOMING").length;
  const required = 6;

  const filtered = useMemo(
    () =>
      history
        .filter((record) => semester === "all" || record.semester === semester)
        .filter((record) => status === "all" || record.status === status)
        .filter((record) => type === "all" || record.assignmentType === type)
        .filter(
          (record) =>
            record.subject.toLowerCase().includes(query.toLowerCase()) ||
            record.className.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [history, semester, status, type, query],
  );

  const byMonth = useMemo(() => {
    const counts = new Map<string, number>();
    history
      .filter((record) => record.status === "COMPLETED")
      .forEach((record) => {
        const month = record.date.slice(0, 7);
        counts.set(month, (counts.get(month) ?? 0) + 1);
      });
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [history]);

  return (
    <div>
      <PageHeader
        subtitle="All exam duties you have served, across terms."
        title="Duty History"
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Required</p>
          <p className="text-2xl font-semibold">{required}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Completed</p>
          <p className="text-2xl font-semibold text-teal-deep">{completed}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Upcoming</p>
          <p className="text-2xl font-semibold">{upcoming}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Remaining</p>
          <p className="text-2xl font-semibold text-coral">{Math.max(required - completed - upcoming, 0)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter by semester"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setSemester(event.target.value)}
          value={semester}
        >
          <option value="all">All semesters</option>
          <option value="Odd 2025-2026">Odd 2025-2026</option>
          <option value="Even 2025-2026">Even 2025-2026</option>
        </select>
        <select
          aria-label="Filter by status"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          aria-label="Filter by assignment type"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          <option value="all">All types</option>
          <option value="SELF_SELECTED">Self-selected</option>
          <option value="AUTO_ASSIGNED">Auto-assigned</option>
          <option value="ADMIN_ASSIGNED">Admin-assigned</option>
        </select>
        <input
          aria-label="Search history"
          className="h-9 w-56 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subject or class"
          value={query}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Exam</th>
                <th className="px-4 py-2.5 font-medium">Subject</th>
                <th className="px-4 py-2.5 font-medium">Class</th>
                <th className="px-4 py-2.5 font-medium">Venue</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr className="border-t border-line" key={record.id}>
                  <td className="whitespace-nowrap px-4 py-2.5">{record.date}</td>
                  <td className="px-4 py-2.5">{record.exam}</td>
                  <td className="px-4 py-2.5 font-medium">{record.subject}</td>
                  <td className="px-4 py-2.5">{record.className}</td>
                  <td className="px-4 py-2.5">{record.venue}</td>
                  <td className="px-4 py-2.5 text-xs">{typeLabels[record.assignmentType]}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      tone={record.status === "COMPLETED" ? "success" : record.status === "UPCOMING" ? "info" : "neutral"}
                    >
                      {record.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={7}>
                    No duty records match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold">Completed duties by month</h2>
          <div className="mt-3 h-56">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e7e2" vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} width={24} />
                <Tooltip />
                <Bar dataKey="count" fill="#24796e" name="Duties" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">Cancelled duties are excluded from the chart.</p>
        </div>
      </div>
    </div>
  );
}
