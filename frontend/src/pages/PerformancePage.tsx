import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { EmptyState, PageHeader } from "../components/common/States";
import { facultyService } from "../services/portalService";

const selectClass =
  "h-9 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink focus-visible:outline-2 focus-visible:outline-teal";

export default function PerformancePage() {
  const performance = facultyService.getPerformance();
  const [subjectId, setSubjectId] = useState(performance[0]?.subjectId ?? "");
  const selected = performance.find((item) => item.subjectId === subjectId) ?? performance[0];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        subtitle="Performance is shown only for subjects and classes you are authorized to view."
        title="Student Performance"
      />

      {performance.length === 0 || !selected ? (
        <EmptyState title="No performance data available." />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-muted">
              Subject / class
              <select
                className={selectClass}
                onChange={(event) => setSubjectId(event.target.value)}
                value={subjectId}
              >
                {performance.map((item) => (
                  <option key={item.subjectId} value={item.subjectId}>
                    {item.subjectCode} - {item.className}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {[
              { label: "Average marks", value: `${selected.averageMarks}%` },
              { label: "Highest marks", value: `${selected.highestMarks}%` },
              { label: "Lowest marks", value: `${selected.lowestMarks}%` },
              { label: "Pass percentage", value: `${selected.passPercentage}%` },
              { label: "Attendance", value: `${selected.attendancePercentage}%` },
            ].map((item) => (
              <div className="rounded-lg border border-line bg-surface p-5 shadow-sm" key={item.label}>
                <p className="text-xs font-semibold uppercase text-muted">{item.label}</p>
                <p className="mt-2 font-serif text-2xl font-medium text-ink">{item.value}</p>
                <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: item.value }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section aria-labelledby="trend-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold" id="trend-heading">
                Performance trend
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={selected.trend}>
                    <CartesianGrid stroke="#e1e7e2" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="assessment" fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <YAxis domain={[0, 100]} fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <Tooltip />
                    <Line
                      dataKey="average"
                      stroke="#24796e"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section aria-labelledby="grades-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold" id="grades-heading">
                Grade distribution
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={selected.gradeDistribution}>
                    <CartesianGrid stroke="#e1e7e2" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="grade" fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#24796e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section aria-labelledby="marks-heading" className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold" id="marks-heading">
                Marks distribution
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={selected.marksDistribution}>
                    <CartesianGrid stroke="#e1e7e2" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} stroke="#6d7a76" tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#bb604b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section aria-labelledby="attendance-performance-heading" className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold" id="attendance-performance-heading">
              Attendance vs performance
            </h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer height="100%" width="100%">
                <ScatterChart>
                  <CartesianGrid stroke="#e1e7e2" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="attendance"
                    domain={[60, 100]}
                    fontSize={11}
                    name="Attendance %"
                    stroke="#6d7a76"
                    tickLine={false}
                  />
                  <YAxis dataKey="marks" domain={[0, 100]} fontSize={11} name="Marks %" stroke="#6d7a76" tickLine={false} />
                  <ZAxis range={[80, 80]} />
                  <Tooltip />
                  <Scatter data={selected.attendanceVsPerformance} fill="#24796e" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
