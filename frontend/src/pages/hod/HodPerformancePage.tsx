import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/common/States";
import { useFacultyDirectory } from "../../services/mockService";

type Metric = "dutyCompliance" | "facultyCount";

export default function HodPerformancePage() {
  const faculty = useFacultyDirectory().filter((member) => member.department === "CSE");
  const [metric, setMetric] = useState<Metric>("dutyCompliance");

  const data = useMemo(
    () =>
      faculty.map((member) => ({
        name: member.name.replace(/^Dr\. |^Prof\. /, ""),
        dutyCompliance: Math.round((member.completedDuties / Math.max(member.requiredDuties, 1)) * 100),
        facultyCount: member.subjectCodes.length,
      })),
    [faculty],
  );

  const averageCompliance = Math.round(
    data.reduce((sum, entry) => sum + entry.dutyCompliance, 0) / Math.max(data.length, 1),
  );

  return (
    <div>
      <PageHeader subtitle="Department-level indicators for Computer Science & Engineering." title="Performance" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Avg duty compliance</p>
          <p className="text-2xl font-semibold">{averageCompliance}%</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Active faculty</p>
          <p className="text-2xl font-semibold">{faculty.filter((member) => member.status === "ACTIVE").length}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Inactive faculty</p>
          <p className="text-2xl font-semibold">{faculty.filter((member) => member.status !== "ACTIVE").length}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-[11px] uppercase text-muted">Subjects handled</p>
          <p className="text-2xl font-semibold">{faculty.reduce((sum, member) => sum + member.subjectCodes.length, 0)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <select
          aria-label="Choose metric"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setMetric(event.target.value as Metric)}
          value={metric}
        >
          <option value="dutyCompliance">Duty compliance %</option>
          <option value="facultyCount">Subjects handled</option>
        </select>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">
          {metric === "dutyCompliance" ? "Duty compliance by faculty" : "Subjects handled by faculty"}
        </h2>
        <div className="mt-3 h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e7e2" horizontal={false} />
              <XAxis fontSize={11} tickLine={false} type="number" />
              <YAxis dataKey="name" fontSize={11} tickLine={false} type="category" width={110} />
              <Tooltip />
              <Bar
                dataKey={metric}
                fill="#24796e"
                name={metric === "dutyCompliance" ? "Compliance %" : "Subjects"}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
