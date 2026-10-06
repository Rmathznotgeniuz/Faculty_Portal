import type { ClassInfo, CurrentUser, DepartmentInfo, FacultyMember, TeachingSubject } from "./types";

export const departments: DepartmentInfo[] = [
  { id: "dept-cse", name: "Computer Science & Engineering", code: "CSE", hodName: "Dr. Meera Rajan" },
  { id: "dept-ece", name: "Electronics & Communication", code: "ECE", hodName: "Dr. K. Vasudevan" },
  { id: "dept-mech", name: "Mechanical Engineering", code: "ME", hodName: "Dr. P. Suresh Kumar" },
  { id: "dept-civil", name: "Civil Engineering", code: "CE", hodName: "Dr. Fathima Beevi" },
];

export const classes: ClassInfo[] = [
  { id: "cls-cse3a", name: "CSE 3rd Semester - Section A", department: "CSE", year: 3, section: "A", advisorId: "fac-001" },
  { id: "cls-cse3b", name: "CSE 3rd Semester - Section B", department: "CSE", year: 3, section: "B", advisorId: "fac-004" },
  { id: "cls-cse5a", name: "CSE 5th Semester - Section A", department: "CSE", year: 5, section: "A", advisorId: "fac-002" },
  { id: "cls-cse5b", name: "CSE 5th Semester - Section B", department: "CSE", year: 5, section: "B" },
  { id: "cls-ece3a", name: "ECE 3rd Semester - Section A", department: "ECE", year: 3, section: "A", advisorId: "fac-008" },
  { id: "cls-mech3a", name: "ME 3rd Semester - Section A", department: "ME", year: 3, section: "A", advisorId: "fac-012" },
];

export const facultyMembers: FacultyMember[] = [
  { id: "fac-001", name: "Dr. Arun Mathew", employeeId: "EMP-1001", email: "arun.mathew@university.edu", department: "CSE", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["CS201", "CS305", "CS310"], classNames: ["CSE 3A", "CSE 5A", "CSE 5B"], requiredDuties: 6, completedDuties: 4 },
  { id: "fac-002", name: "Dr. Meera Rajan", employeeId: "EMP-1002", email: "meera.rajan@university.edu", department: "CSE", designation: "Professor", status: "ACTIVE", subjectCodes: ["CS401", "CS402"], classNames: ["CSE 7A"], requiredDuties: 1, completedDuties: 1 },
  { id: "fac-003", name: "Dr. Ananya Krishnan", employeeId: "EMP-1003", email: "ananya.krishnan@university.edu", department: "CSE", designation: "Associate Professor", status: "ACTIVE", subjectCodes: ["CS301", "CS308"], classNames: ["CSE 5A", "CSE 5B"], requiredDuties: 2, completedDuties: 2 },
  { id: "fac-004", name: "Prof. Rahul Verma", employeeId: "EMP-1004", email: "rahul.verma@university.edu", department: "CSE", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["CS202", "CS204"], classNames: ["CSE 3A", "CSE 3B"], requiredDuties: 6, completedDuties: 2 },
  { id: "fac-005", name: "Dr. Sneha Pillai", employeeId: "EMP-1005", email: "sneha.pillai@university.edu", department: "CSE", designation: "Associate Professor", status: "ACTIVE", subjectCodes: ["CS306"], classNames: ["CSE 7A"], requiredDuties: 2, completedDuties: 0 },
  { id: "fac-006", name: "Dr. Vikram Menon", employeeId: "EMP-1006", email: "vikram.menon@university.edu", department: "CSE", designation: "Professor", status: "ACTIVE", subjectCodes: ["CS403"], classNames: ["CSE 7B"], requiredDuties: 1, completedDuties: 0 },
  { id: "fac-007", name: "Prof. Divya Nair", employeeId: "EMP-1007", email: "divya.nair@university.edu", department: "CSE", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["CS203"], classNames: ["CSE 3B"], requiredDuties: 6, completedDuties: 5 },
  { id: "fac-008", name: "Dr. K. Vasudevan", employeeId: "EMP-1008", email: "k.vasudevan@university.edu", department: "ECE", designation: "Professor", status: "ACTIVE", subjectCodes: ["EC201"], classNames: ["ECE 3A"], requiredDuties: 1, completedDuties: 1 },
  { id: "fac-009", name: "Prof. Lakshmi Suresh", employeeId: "EMP-1009", email: "lakshmi.suresh@university.edu", department: "ECE", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["EC205"], classNames: ["ECE 3A"], requiredDuties: 6, completedDuties: 3 },
  { id: "fac-010", name: "Dr. Harish Kumar", employeeId: "EMP-1010", email: "harish.kumar@university.edu", department: "ECE", designation: "Associate Professor", status: "INACTIVE", subjectCodes: ["EC209"], classNames: ["ECE 5A"], requiredDuties: 2, completedDuties: 1 },
  { id: "fac-011", name: "Dr. P. Suresh Kumar", employeeId: "EMP-1011", email: "suresh.kumar@university.edu", department: "ME", designation: "Professor", status: "ACTIVE", subjectCodes: ["ME201"], classNames: ["ME 3A"], requiredDuties: 1, completedDuties: 1 },
  { id: "fac-012", name: "Prof. Arjun Das", employeeId: "EMP-1012", email: "arjun.das@university.edu", department: "ME", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["ME205"], classNames: ["ME 3A"], requiredDuties: 6, completedDuties: 4 },
  { id: "fac-013", name: "Dr. Fathima Beevi", employeeId: "EMP-1013", email: "fathima.beevi@university.edu", department: "CE", designation: "Professor", status: "ACTIVE", subjectCodes: ["CE201"], classNames: ["CE 3A"], requiredDuties: 1, completedDuties: 0 },
  { id: "fac-014", name: "Prof. Nithin George", employeeId: "EMP-1014", email: "nithin.george@university.edu", department: "CE", designation: "Assistant Professor", status: "ACTIVE", subjectCodes: ["CE204"], classNames: ["CE 3A"], requiredDuties: 6, completedDuties: 6 },
  { id: "fac-015", name: "Dr. Rekha Warrier", employeeId: "EMP-1015", email: "rekha.warrier@university.edu", department: "CSE", designation: "Associate Professor", status: "ACTIVE", subjectCodes: ["CS307"], classNames: ["CSE 7A"], requiredDuties: 2, completedDuties: 1 },
];

export const currentUsers: Record<"FACULTY" | "HOD" | "ADMIN", CurrentUser> = {
  FACULTY: {
    id: "user-faculty",
    name: "Dr. Arun Mathew",
    employeeId: "EMP-1001",
    email: "arun.mathew@university.edu",
    role: "FACULTY",
    department: "Computer Science & Engineering",
    designation: "Assistant Professor",
    facultyId: "fac-001",
  },
  HOD: {
    id: "user-hod",
    name: "Dr. Meera Rajan",
    employeeId: "EMP-1002",
    email: "meera.rajan@university.edu",
    role: "HOD",
    department: "Computer Science & Engineering",
    designation: "Professor",
    facultyId: "fac-002",
  },
  ADMIN: {
    id: "user-admin",
    name: "Suresh Iyer",
    employeeId: "EMP-0001",
    email: "suresh.iyer@university.edu",
    role: "ADMIN",
    department: "Administration",
    designation: "System Administrator",
  },
};

export const teachingSubjects: TeachingSubject[] = [
  { id: "tsub-001", code: "CS201", name: "Data Structures", classId: "cls-cse3a", className: "CSE 3A", facultyId: "fac-001", facultyName: "Dr. Arun Mathew", studentCount: 28, credits: 4 },
  { id: "tsub-002", code: "CS305", name: "Operating Systems", classId: "cls-cse5b", className: "CSE 5B", facultyId: "fac-001", facultyName: "Dr. Arun Mathew", studentCount: 26, credits: 4 },
  { id: "tsub-003", code: "CS310", name: "Computer Networks", classId: "cls-cse5a", className: "CSE 5A", facultyId: "fac-001", facultyName: "Dr. Arun Mathew", studentCount: 30, credits: 3 },
];

export const allSubjects: TeachingSubject[] = [
  ...teachingSubjects,
  { id: "tsub-004", code: "CS202", name: "Object Oriented Programming", classId: "cls-cse3a", className: "CSE 3A", facultyId: "fac-004", facultyName: "Prof. Rahul Verma", studentCount: 28, credits: 4 },
  { id: "tsub-005", code: "CS204", name: "Database Management Systems", classId: "cls-cse3b", className: "CSE 3B", facultyId: "fac-004", facultyName: "Prof. Rahul Verma", studentCount: 27, credits: 4 },
  { id: "tsub-006", code: "CS203", name: "Discrete Mathematics", classId: "cls-cse3b", className: "CSE 3B", facultyId: "fac-007", facultyName: "Prof. Divya Nair", studentCount: 27, credits: 3 },
  { id: "tsub-007", code: "CS301", name: "Algorithm Design", classId: "cls-cse5a", className: "CSE 5A", facultyId: "fac-003", facultyName: "Dr. Ananya Krishnan", studentCount: 30, credits: 4 },
  { id: "tsub-008", code: "CS308", name: "Software Engineering", classId: "cls-cse5b", className: "CSE 5B", facultyId: "fac-003", facultyName: "Dr. Ananya Krishnan", studentCount: 26, credits: 3 },
  { id: "tsub-009", code: "CS401", name: "Machine Learning", classId: "cls-cse5a", className: "CSE 5A", facultyId: "fac-002", facultyName: "Dr. Meera Rajan", studentCount: 30, credits: 4 },
  { id: "tsub-010", code: "CS402", name: "Compiler Design", classId: "cls-cse5b", className: "CSE 5B", facultyId: "fac-002", facultyName: "Dr. Meera Rajan", studentCount: 26, credits: 4 },
  { id: "tsub-011", code: "EC201", name: "Signals and Systems", classId: "cls-ece3a", className: "ECE 3A", facultyId: "fac-008", facultyName: "Dr. K. Vasudevan", studentCount: 25, credits: 4 },
  { id: "tsub-012", code: "ME201", name: "Thermodynamics", classId: "cls-mech3a", className: "ME 3A", facultyId: "fac-011", facultyName: "Dr. P. Suresh Kumar", studentCount: 24, credits: 4 },
];
