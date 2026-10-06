import type { ReactNode } from "react";

export function SummaryCard({
  label,
  value,
  context,
  icon,
}: {
  label: string;
  value: number | string;
  context: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-teal/10 text-teal-deep">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl font-medium text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{context}</p>
    </div>
  );
}
