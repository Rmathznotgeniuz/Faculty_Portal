import type { Notification } from "./types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    title: "Duty selection window open",
    message:
      "Selection for End Semester Examination duties (Oct 8-14) is now open. Deadline: Oct 5.",
    timestamp: "2026-10-01T09:30:00",
    category: "EXAM_DUTY",
    read: false,
  },
  {
    id: "notif-002",
    title: "Assignment confirmed",
    message:
      "You have been assigned invigilation duty for CS204 Database Management Systems on Oct 9.",
    timestamp: "2026-09-30T16:45:00",
    category: "EXAM_DUTY",
    read: false,
  },
  {
    id: "notif-003",
    title: "Model exam marks uploaded",
    message: "Model exam marks for CS301 Data Structures have been published to students.",
    timestamp: "2026-09-29T11:20:00",
    category: "ACADEMIC",
    read: false,
  },
  {
    id: "notif-004",
    title: "Academic council minutes",
    message: "Minutes of the September academic council meeting are available in the portal.",
    timestamp: "2026-09-28T10:00:00",
    category: "ADMIN",
    read: true,
  },
  {
    id: "notif-005",
    title: "Scheduled maintenance",
    message: "The portal will be unavailable on Oct 4, 10 PM - 12 AM due to maintenance.",
    timestamp: "2026-09-27T08:15:00",
    category: "SYSTEM",
    read: true,
  },
];
