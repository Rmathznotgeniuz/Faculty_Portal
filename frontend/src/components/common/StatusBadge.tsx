import type { AssignmentType, DutyStatus, NotificationCategory } from "../../data/types";

const toneClasses = {
  neutral: "bg-canvas text-muted border-line",
  info: "bg-teal/10 text-teal-deep border-teal/20",
  success: "bg-lime/10 text-lime border-lime/30",
  warning: "bg-coral-soft text-coral border-coral/30",
  error: "bg-red-50 text-red-700 border-red-200",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export function StatusBadge({ label, children, tone }: { label?: string; children?: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children ?? label}
    </span>
  );
}

export const dutyStatusTone: Record<DutyStatus, BadgeTone> = {
  AVAILABLE: "info",
  SELECTED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  CLOSED: "neutral",
};

export const assignmentTypeLabel: Record<AssignmentType, string> = {
  SELF_SELECTED: "Self selected",
  AUTO_ASSIGNED: "Auto assigned",
  ADMIN_ASSIGNED: "Admin assigned",
};

export const notificationCategoryLabel: Record<NotificationCategory, string> = {
  EXAM_DUTY: "Exam duty",
  ACADEMIC: "Academic",
  SYSTEM: "System",
  ADMIN: "Admin",
};
