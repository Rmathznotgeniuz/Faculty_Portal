export type Role = "FACULTY" | "HOD" | "ADMIN";
export type FacultyStatus = "ACTIVE" | "INACTIVE";
export type DutyLifecycle = "OPEN" | "FULL" | "CLOSED" | "CANCELLED";
export type AllocationStatus = "SATISFIED" | "PARTIALLY_FULFILLED" | "UNFULFILLED";
export type StudentRiskStatus = "EXCELLENT" | "AVERAGE" | "AT_RISK" | "LOW_ATTENDANCE" | "FAILED";

export interface CurrentUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  facultyId?: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  hodName: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  department: string;
  year: number;
  section: string;
  advisorId?: string;
}

export interface TeachingSubject {
  id: string;
  code: string;
  name: string;
  classId: string;
  className: string;
  facultyId: string;
  facultyName: string;
  studentCount: number;
  credits: number;
}

export interface StudentRecord {
  id: string;
  registerNumber: string;
  name: string;
  rollNumber: number;
  classId: string;
  className: string;
  department: string;
  attendance: number;
}

export interface SubjectMark {
  internal: number;
  assignment: number;
  midterm: number;
  final: number;
  total: number;
  grade: string;
}

export interface StudentSubjectResult extends SubjectMark {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: "Professor" | "Associate Professor" | "Assistant Professor";
  status: FacultyStatus;
  subjectCodes: string[];
  classNames: string[];
  requiredDuties: number;
  completedDuties: number;
}

export interface WorkloadPolicy {
  id: string;
  designation: string;
  requiredDuties: number;
  effectiveFrom: string;
  effectiveUntil: string;
  status: "ACTIVE" | "SUPERSEDED";
}

export interface DutyHistoryRecord {
  id: string;
  date: string;
  exam: string;
  subject: string;
  className: string;
  venue: string;
  time: string;
  assignmentType: "SELF_SELECTED" | "AUTO_ASSIGNED" | "ADMIN_ASSIGNED";
  status: "COMPLETED" | "UPCOMING" | "CANCELLED";
  semester: "Odd 2025-2026" | "Even 2025-2026";
}

export interface AdminDuty {
  id: string;
  exam: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  assigned: number;
  eligibleDepartments: string[];
  eligibleDesignations: string[];
  selectionOpens: string;
  selectionCloses: string;
  status: DutyLifecycle;
}

export interface AllocationResult {
  facultyId: string;
  facultyName: string;
  designation: string;
  required: number;
  alreadyAssigned: number;
  autoAssigned: number;
  remaining: number;
  status: AllocationStatus;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  outcome: "SUCCESS" | "FAILURE";
}
