import type { AdminDuty, AllocationResult, AuditLogEntry, DutyHistoryRecord, WorkloadPolicy } from "./types";

export const workloadPolicies: WorkloadPolicy[] = [
  { id: "wp-001", designation: "Professor", requiredDuties: 1, effectiveFrom: "2025-06-01", effectiveUntil: "2025-12-31", status: "SUPERSEDED" },
  { id: "wp-002", designation: "Associate Professor", requiredDuties: 2, effectiveFrom: "2025-06-01", effectiveUntil: "2025-12-31", status: "SUPERSEDED" },
  { id: "wp-003", designation: "Assistant Professor", requiredDuties: 6, effectiveFrom: "2025-06-01", effectiveUntil: "2025-12-31", status: "SUPERSEDED" },
  { id: "wp-004", designation: "Professor", requiredDuties: 1, effectiveFrom: "2026-01-01", effectiveUntil: "2026-12-31", status: "ACTIVE" },
  { id: "wp-005", designation: "Associate Professor", requiredDuties: 2, effectiveFrom: "2026-01-01", effectiveUntil: "2026-12-31", status: "ACTIVE" },
  { id: "wp-006", designation: "Assistant Professor", requiredDuties: 6, effectiveFrom: "2026-01-01", effectiveUntil: "2026-12-31", status: "ACTIVE" },
];

export const adminDuties: AdminDuty[] = [
  { id: "aduty-001", exam: "End Semester Examination", subjectCode: "CS201", subjectName: "Data Structures", date: "2026-11-18", time: "09:30 - 12:00", venue: "Main Hall A", capacity: 40, assigned: 38, eligibleDepartments: ["CSE"], eligibleDesignations: ["Assistant Professor", "Associate Professor"], selectionOpens: "2026-10-01", selectionCloses: "2026-11-10", status: "OPEN" },
  { id: "aduty-002", exam: "End Semester Examination", subjectCode: "CS305", subjectName: "Operating Systems", date: "2026-11-20", time: "14:00 - 16:30", venue: "Main Hall B", capacity: 35, assigned: 35, eligibleDepartments: ["CSE", "ECE"], eligibleDesignations: ["Assistant Professor", "Associate Professor"], selectionOpens: "2026-10-01", selectionCloses: "2026-11-10", status: "FULL" },
  { id: "aduty-003", exam: "End Semester Examination", subjectCode: "CS310", subjectName: "Computer Networks", date: "2026-11-22", time: "09:30 - 12:00", venue: "Annex Hall 1", capacity: 30, assigned: 12, eligibleDepartments: ["CSE"], eligibleDesignations: ["Assistant Professor", "Associate Professor", "Professor"], selectionOpens: "2026-10-01", selectionCloses: "2026-11-12", status: "OPEN" },
  { id: "aduty-004", exam: "End Semester Examination", subjectCode: "EC201", subjectName: "Signals and Systems", date: "2026-11-19", time: "14:00 - 16:30", venue: "ECE Block Hall 2", capacity: 25, assigned: 25, eligibleDepartments: ["ECE"], eligibleDesignations: ["Assistant Professor"], selectionOpens: "2026-10-05", selectionCloses: "2026-11-10", status: "FULL" },
  { id: "aduty-005", exam: "Mid Semester Examination", subjectCode: "ME201", subjectName: "Thermodynamics", date: "2026-10-14", time: "09:30 - 11:00", venue: "ME Block Hall 1", capacity: 20, assigned: 20, eligibleDepartments: ["ME"], eligibleDesignations: ["Assistant Professor", "Associate Professor"], selectionOpens: "2026-09-01", selectionCloses: "2026-10-05", status: "CLOSED" },
  { id: "aduty-006", exam: "Supplementary Examination", subjectCode: "CS202", subjectName: "Object Oriented Programming", date: "2026-12-02", time: "09:30 - 11:00", venue: "Main Hall A", capacity: 20, assigned: 0, eligibleDepartments: ["CSE"], eligibleDesignations: ["Assistant Professor"], selectionOpens: "2026-11-15", selectionCloses: "2026-11-28", status: "OPEN" },
  { id: "aduty-007", exam: "Practical Examination", subjectCode: "CS204", subjectName: "Database Management Systems", date: "2026-10-28", time: "14:00 - 16:00", venue: "Lab Complex 2", capacity: 15, assigned: 15, eligibleDepartments: ["CSE"], eligibleDesignations: ["Assistant Professor", "Associate Professor"], selectionOpens: "2026-09-20", selectionCloses: "2026-10-20", status: "CANCELLED" },
];

export const allocationResults: AllocationResult[] = [
  { facultyId: "fac-004", facultyName: "Prof. Rahul Verma", designation: "Assistant Professor", required: 6, alreadyAssigned: 2, autoAssigned: 1, remaining: 3, status: "PARTIALLY_FULFILLED" },
  { facultyId: "fac-007", facultyName: "Prof. Divya Nair", designation: "Assistant Professor", required: 6, alreadyAssigned: 5, autoAssigned: 1, remaining: 0, status: "SATISFIED" },
  { facultyId: "fac-001", facultyName: "Dr. Arun Mathew", designation: "Assistant Professor", required: 6, alreadyAssigned: 4, autoAssigned: 1, remaining: 1, status: "PARTIALLY_FULFILLED" },
  { facultyId: "fac-005", facultyName: "Dr. Sneha Pillai", designation: "Associate Professor", required: 2, alreadyAssigned: 0, autoAssigned: 1, remaining: 1, status: "PARTIALLY_FULFILLED" },
  { facultyId: "fac-009", facultyName: "Prof. Lakshmi Suresh", designation: "Assistant Professor", required: 6, alreadyAssigned: 3, autoAssigned: 1, remaining: 2, status: "PARTIALLY_FULFILLED" },
  { facultyId: "fac-002", facultyName: "Dr. Meera Rajan", designation: "Professor", required: 1, alreadyAssigned: 1, autoAssigned: 0, remaining: 0, status: "SATISFIED" },
  { facultyId: "fac-006", facultyName: "Dr. Vikram Menon", designation: "Professor", required: 1, alreadyAssigned: 0, autoAssigned: 0, remaining: 1, status: "UNFULFILLED" },
];

export const auditLogEntries: AuditLogEntry[] = [
  { id: "audit-001", timestamp: "2026-10-01T09:05:00", actor: "SYSTEM", action: "AUTO_ALLOCATION_RUN", entity: "AllocationRun", entityId: "alloc-2026-10-01", outcome: "SUCCESS" },
  { id: "audit-002", timestamp: "2026-09-30T16:40:00", actor: "Suresh Iyer (ADMIN)", action: "DUTY_CREATED", entity: "ExamDuty", entityId: "aduty-006", outcome: "SUCCESS" },
  { id: "audit-003", timestamp: "2026-09-30T16:42:00", actor: "Suresh Iyer (ADMIN)", action: "DUTY_CANCELLED", entity: "ExamDuty", entityId: "aduty-007", outcome: "SUCCESS" },
  { id: "audit-004", timestamp: "2026-09-29T11:15:00", actor: "Dr. Arun Mathew (FACULTY)", action: "DUTY_SELECTED", entity: "DutyAssignment", entityId: "asg-004", outcome: "SUCCESS" },
  { id: "audit-005", timestamp: "2026-09-29T11:16:00", actor: "Prof. Divya Nair (FACULTY)", action: "DUTY_SELECTED", entity: "DutyAssignment", entityId: "asg-005", outcome: "FAILURE" },
  { id: "audit-006", timestamp: "2026-09-28T10:00:00", actor: "Dr. Meera Rajan (HOD)", action: "WORKLOAD_POLICY_VIEWED", entity: "WorkloadPolicy", entityId: "wp-004", outcome: "SUCCESS" },
  { id: "audit-007", timestamp: "2026-09-27T14:30:00", actor: "Suresh Iyer (ADMIN)", action: "FACULTY_DEACTIVATED", entity: "Faculty", entityId: "fac-010", outcome: "SUCCESS" },
  { id: "audit-008", timestamp: "2026-09-26T09:20:00", actor: "Suresh Iyer (ADMIN)", action: "DUTY_MANUALLY_ASSIGNED", entity: "DutyAssignment", entityId: "asg-006", outcome: "SUCCESS" },
];

export function dutyHistoryFor(facultyId: string): DutyHistoryRecord[] {
  const seeds = [
    { date: "2025-12-12", exam: "Mid Semester", subject: "CS201 Data Structures", className: "CSE 3A", venue: "Main Hall A", time: "09:30 - 11:00", assignmentType: "SELF_SELECTED" as const, status: "COMPLETED" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-12-15", exam: "Mid Semester", subject: "CS305 Operating Systems", className: "CSE 5B", venue: "Main Hall B", time: "14:00 - 15:30", assignmentType: "SELF_SELECTED" as const, status: "COMPLETED" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-12-18", exam: "Mid Semester", subject: "CS310 Computer Networks", className: "CSE 5A", venue: "Annex Hall 1", time: "09:30 - 11:00", assignmentType: "AUTO_ASSIGNED" as const, status: "COMPLETED" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-12-20", exam: "Mid Semester", subject: "CS201 Data Structures", className: "CSE 3B", venue: "Main Hall C", time: "14:00 - 15:30", assignmentType: "SELF_SELECTED" as const, status: "COMPLETED" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-11-18", exam: "End Semester", subject: "CS201 Data Structures", className: "CSE 3A", venue: "Main Hall A", time: "09:30 - 12:00", assignmentType: "SELF_SELECTED" as const, status: "UPCOMING" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-11-20", exam: "End Semester", subject: "CS305 Operating Systems", className: "CSE 5B", venue: "Main Hall B", time: "14:00 - 16:30", assignmentType: "AUTO_ASSIGNED" as const, status: "UPCOMING" as const, semester: "Odd 2025-2026" as const },
    { date: "2025-05-02", exam: "Supplementary", subject: "CS202 Object Oriented Programming", className: "CSE 3A", venue: "Main Hall A", time: "09:30 - 11:00", assignmentType: "ADMIN_ASSIGNED" as const, status: "CANCELLED" as const, semester: "Even 2025-2026" as const },
  ];
  return seeds.map((entry, index) => ({ id: `${facultyId}-hist-${index + 1}`, ...entry }));
}

export function allocationSummary(): { assigned: number; unfulfilled: number } {
  const assigned = allocationResults.filter((result) => result.status !== "UNFULFILLED").length;
  const unfulfilled = allocationResults.filter((result) => result.status === "UNFULFILLED").length;
  return { assigned, unfulfilled };
}
