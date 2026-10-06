export type Department =
  | "Computer Science"
  | "Electronics and Communication"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Mathematics";

export type Designation = "Professor" | "Associate Professor" | "Assistant Professor";

export type AssignmentType = "SELF_SELECTED" | "AUTO_ASSIGNED" | "ADMIN_ASSIGNED";

export type DutyStatus = "AVAILABLE" | "SELECTED" | "COMPLETED" | "CANCELLED" | "CLOSED";

export type NotificationCategory = "EXAM_DUTY" | "ACADEMIC" | "SYSTEM" | "ADMIN";

export interface Faculty {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: Department;
  designation: Designation;
  academicRoles: string[];
  isClassAdvisor: boolean;
  advisorClass?: string;
}

export interface ExamDuty {
  id: string;
  examName: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  department: Department;
  totalSeats: number;
  filledSeats: number;
  eligibleDesignations: Designation[];
  selectionDeadline: string;
  status: DutyStatus;
}

export interface DutyAssignment {
  id: string;
  dutyId: string;
  examName: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  assignmentType: AssignmentType;
  status: DutyStatus;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  className: string;
  academicYear: string;
  semester: string;
  studentCount: number;
  facultyRole: string;
}

export interface PerformanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
  attendancePercentage: number;
  gradeDistribution: { grade: string; count: number }[];
  marksDistribution: { range: string; students: number }[];
  attendanceVsPerformance: { attendance: number; marks: number }[];
  trend: { assessment: string; average: number }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
}

export interface ClassAdvisorSummary {
  className: string;
  studentCount: number;
  averageAttendance: number;
  averagePerformance: number;
  subjects: { code: string; name: string; faculty: string }[];
  alerts: { id: string; severity: "warning" | "info"; message: string }[];
}

export interface AcademicTerm {
  academicYear: string;
  semester: string;
}
