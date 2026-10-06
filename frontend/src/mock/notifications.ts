import type { Notification } from "../data/types";

export const mockNotificationsV2: Notification[] = [
  { id: "notif-001", category: "EXAM_DUTY", title: "Duty selection window open", message: "Selection for End Semester Examination duties (Nov 2026) is now open. Complete your obligation before the window closes on 10 Nov.", timestamp: "2026-10-01T09:10:00", read: false },
  { id: "notif-002", category: "EXAM_DUTY", title: "Auto-allocated to CS305 duty", message: "You were auto-assigned to End Semester Examination - CS305 on 20 Nov 2026 (AN session) by the allocation engine.", timestamp: "2026-10-01T09:05:00", read: false },
  { id: "notif-003", category: "ACADEMIC", title: "Internal marks due", message: "Internal marks for CS201 Data Structures (CSE 3A) must be submitted before 15 Oct 2026.", timestamp: "2026-09-28T10:00:00", read: false },
  { id: "notif-004", category: "SYSTEM", title: "Workload policy updated", message: "The 2026 workload policy is now effective. Assistant Professors: 6 duties per term.", timestamp: "2026-09-25T08:30:00", read: true },
  { id: "notif-005", category: "EXAM_DUTY", title: "Duty cancelled", message: "Practical Examination - CS204 on 28 Oct has been cancelled. Your assignment for this duty is void.", timestamp: "2026-09-30T16:45:00", read: true },
  { id: "notif-006", category: "ACADEMIC", title: "Class advisor report ready", message: "The September attendance and performance summary for CSE 3A is available.", timestamp: "2026-09-24T12:00:00", read: true },
];
