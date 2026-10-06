import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import { updateWorkloadPolicy, useWorkloadPolicies } from "../../services/mockService";

export default function AdminWorkloadPage() {
  const policies = useWorkloadPolicies();

  return (
    <div>
      <PageHeader
        subtitle="Monthly exam duty obligations by designation. Edits apply to future allocation runs."
        title="Workload Policy"
      />
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Designation</th>
              <th className="px-4 py-2.5 font-medium">Required duties / month</th>
              <th className="px-4 py-2.5 font-medium">Effective from</th>
              <th className="px-4 py-2.5 font-medium">Effective until</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr className="border-t border-line" key={policy.id}>
                <td className="px-4 py-2.5 font-medium">{policy.designation}</td>
                <td className="px-4 py-2.5">
                  <input
                    aria-label={`Required duties for ${policy.designation}`}
                    className="h-8 w-16 rounded-md border border-line px-2 text-sm"
                    max={12}
                    min={0}
                    onChange={(event) => updateWorkloadPolicy(policy.id, Number(event.target.value) || 0)}
                    type="number"
                    value={policy.requiredDuties}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">{policy.effectiveFrom}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{policy.effectiveUntil}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={policy.status === "ACTIVE" ? "success" : "neutral"}>{policy.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Changes are in-memory only and reset on page reload.</p>
    </div>
  );
}
