import { Link } from "react-router-dom";
import { facultyService } from "../../services/portalService";

export function PerformanceOverview() {
  const performance = facultyService.getPerformance();

  return (
    <section aria-labelledby="performance-overview-heading" className="rounded-lg border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold" id="performance-overview-heading">
          Student Performance
        </h2>
        <Link className="text-xs font-medium text-teal-deep hover:underline" to="/performance">
          View details
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {performance.map((item) => (
          <li className="px-5 py-3.5" key={item.subjectId}>
            <div className="flex items-center justify-between gap-4">
              <p className="truncate text-sm font-medium text-ink">
                {item.subjectCode} - {item.subjectName}
              </p>
              <p className="shrink-0 text-sm font-semibold text-teal-deep">{item.averageMarks}%</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div
                aria-label={`Pass percentage ${item.passPercentage}%`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={item.passPercentage}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas"
                role="progressbar"
              >
                <div className="h-full rounded-full bg-lime" style={{ width: `${item.passPercentage}%` }} />
              </div>
              <span className="text-xs text-muted">{item.passPercentage}% pass</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
