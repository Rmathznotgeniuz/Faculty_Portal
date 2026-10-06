export function DutyProgress({
  required,
  completed,
}: {
  required: number;
  completed: number;
}) {
  const percentage = required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;
  const remaining = Math.max(0, required - completed);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink">Required duties</p>
        <p className="text-sm font-semibold text-teal-deep">{percentage}%</p>
      </div>
      <div
        aria-label={`Duty progress: ${completed} of ${required} completed`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-md border border-line bg-canvas px-2 py-2">
          <dt className="text-[11px] uppercase text-muted">Required</dt>
          <dd className="text-sm font-semibold">{required}</dd>
        </div>
        <div className="rounded-md border border-line bg-canvas px-2 py-2">
          <dt className="text-[11px] uppercase text-muted">Completed</dt>
          <dd className="text-sm font-semibold text-lime">{completed}</dd>
        </div>
        <div className="rounded-md border border-line bg-canvas px-2 py-2">
          <dt className="text-[11px] uppercase text-muted">Remaining</dt>
          <dd className="text-sm font-semibold text-coral">{remaining}</dd>
        </div>
      </dl>
    </div>
  );
}
