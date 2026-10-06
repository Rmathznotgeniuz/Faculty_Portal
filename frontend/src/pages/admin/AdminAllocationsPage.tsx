import { useState } from "react";
import { Play } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useAllocationResults } from "../../services/mockService";

export default function AdminAllocationsPage() {
  const results = useAllocationResults();
  const [lastRun, setLastRun] = useState<string | null>(null);

  const unfulfilled = results.filter((result) => result.status !== "SATISFIED").length;

  return (
    <div>
      <PageHeader subtitle="Simulate automatic duty allocation against monthly obligations." title="Allocations" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-deep"
          onClick={() => setLastRun(new Date().toISOString().slice(0, 16).replace("T", " "))}
          type="button"
        >
          <Play aria-hidden="true" size={14} /> Run allocation
        </button>
        {lastRun && <span className="text-xs text-muted">Last simulated run: {lastRun}</span>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Faculty evaluated</p>
          <p className="text-2xl font-semibold">{results.length}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Satisfied</p>
          <p className="text-2xl font-semibold text-teal-deep">
            {results.filter((result) => result.status === "SATISFIED").length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Unfulfilled</p>
          <p className="text-2xl font-semibold text-coral">{unfulfilled}</p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Faculty</th>
              <th className="px-4 py-2.5 font-medium">Designation</th>
              <th className="px-4 py-2.5 font-medium">Required</th>
              <th className="px-4 py-2.5 font-medium">Already assigned</th>
              <th className="px-4 py-2.5 font-medium">Auto-assigned</th>
              <th className="px-4 py-2.5 font-medium">Remaining</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr className="border-t border-line" key={result.facultyId}>
                <td className="px-4 py-2.5 font-medium">{result.facultyName}</td>
                <td className="px-4 py-2.5">{result.designation}</td>
                <td className="px-4 py-2.5">{result.required}</td>
                <td className="px-4 py-2.5">{result.alreadyAssigned}</td>
                <td className="px-4 py-2.5">{result.autoAssigned}</td>
                <td className="px-4 py-2.5">{result.remaining}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    tone={result.status === "SATISFIED" ? "success" : result.status === "PARTIALLY_FULFILLED" ? "warning" : "error"}
                  >
                    {result.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
