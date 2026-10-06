import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useAuditLog } from "../../services/mockService";

export default function AdminAuditPage() {
  const entries = useAuditLog();
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");

  const filtered = useMemo(
    () =>
      entries
        .filter((entry) => outcome === "all" || entry.outcome === outcome)
        .filter(
          (entry) =>
            entry.actor.toLowerCase().includes(query.toLowerCase()) ||
            entry.action.toLowerCase().includes(query.toLowerCase()) ||
            entry.entity.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [entries, query, outcome],
  );

  return (
    <div>
      <PageHeader subtitle="Full audit trail of portal actions for the current term." title="Audit Log" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 text-muted" size={16} />
          <input
            className="h-9 w-56 rounded-md border border-line bg-surface pl-8 pr-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actor, action, or entity"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by outcome"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setOutcome(event.target.value)}
          value={outcome}
        >
          <option value="all">All outcomes</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Timestamp</th>
              <th className="px-4 py-2.5 font-medium">Actor</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
              <th className="px-4 py-2.5 font-medium">Entity</th>
              <th className="px-4 py-2.5 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr className="border-t border-line" key={entry.id}>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{entry.timestamp}</td>
                <td className="px-4 py-2.5">{entry.actor}</td>
                <td className="px-4 py-2.5 font-medium">{entry.action}</td>
                <td className="px-4 py-2.5 text-xs">
                  {entry.entity} {entry.entityId}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={entry.outcome === "SUCCESS" ? "success" : "error"}>{entry.outcome}</StatusBadge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                  No audit entries match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
