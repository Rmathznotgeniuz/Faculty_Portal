import { classes } from "./users";
import type { StudentRecord, StudentSubjectResult, SubjectMark } from "./types";
import { gradeFor, seeded, seededRange } from "./util";

const firstNames = [
  "Aarav", "Diya", "Rohan", "Ananya", "Vivaan", "Ishita", "Arjun", "Meera", "Kabir", "Sara",
  "Aditya", "Nithya", "Rahul", "Priya", "Devan", "Keerthi", "Siddharth", "Riya", "Karthik",
  "Anjali", "Nikhil", "Tanvi", "Arun", "Sneha", "Manoj", "Deepa", "Varun", "Aishwarya",
  "Sanjay", "Lakshmi",
];
const lastNames = [
  "Sharma", "Menon", "Thomas", "Nair", "Pillai", "Iyer", "Kurup", "Warrier", "Gopal", "Rajan",
  "Varma", "Krishnan", "Mohan", "Pillai", "Antony", "George", "Mathew", "Joseph", "Kumar",
  "Das",
];

function buildStudents(classId: string, className: string, department: string, count: number, prefix: string): StudentRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = `${classId}-${index}`;
    const first = firstNames[Math.floor(seeded(`${seed}-f`) * firstNames.length)];
    const last = lastNames[Math.floor(seeded(`${seed}-l`) * lastNames.length)];
    return {
      id: `${classId}-stu-${index + 1}`,
      registerNumber: `${prefix}2025${String(index + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      rollNumber: index + 1,
      classId,
      className,
      department,
      attendance: seededRange(`${seed}-att`, 62, 98),
    };
  });
}

export const studentsByClass: Record<string, StudentRecord[]> = {
  "cls-cse3a": buildStudents("cls-cse3a", "CSE 3A", "Computer Science & Engineering", 28, "CSE2025"),
  "cls-cse3b": buildStudents("cls-cse3b", "CSE 3B", "Computer Science & Engineering", 27, "CSE2026"),
  "cls-cse5a": buildStudents("cls-cse5a", "CSE 5A", "Computer Science & Engineering", 30, "CSE2023"),
  "cls-cse5b": buildStudents("cls-cse5b", "CSE 5B", "Computer Science & Engineering", 26, "CSE2024"),
  "cls-ece3a": buildStudents("cls-ece3a", "ECE 3A", "Electronics & Communication", 25, "ECE2025"),
  "cls-mech3a": buildStudents("cls-mech3a", "ME 3A", "Mechanical Engineering", 24, "ME2025"),
};

export const allStudents: StudentRecord[] = Object.values(studentsByClass).flat();

export function classStudents(classId: string): StudentRecord[] {
  return studentsByClass[classId] ?? [];
}

export function studentMark(student: StudentRecord, subjectCode: string): SubjectMark {
  const seed = `${student.id}-${subjectCode}`;
  const internal = seededRange(`${seed}-i`, 12, 25);
  const assignment = seededRange(`${seed}-a`, 6, 10);
  const midterm = seededRange(`${seed}-m`, 18, 30);
  const final = seededRange(`${seed}-f`, 22, 35);
  const total = internal + assignment + midterm + final;
  return { internal, assignment, midterm, final, total, grade: gradeFor(total) };
}

export function studentResults(student: StudentRecord, subjects: { code: string; name: string; facultyName: string }[]): StudentSubjectResult[] {
  return subjects.map((subject) => ({
    subjectId: subject.code,
    subjectCode: subject.code,
    subjectName: subject.name,
    facultyName: subject.facultyName,
    ...studentMark(student, subject.code),
  }));
}

export function classSubjectRoster(classId: string): { code: string; name: string; facultyName: string }[] {
  const cls = classes.find((item) => item.id === classId);
  const prefix = cls?.department === "CSE" ? "CS" : cls?.department === "ECE" ? "EC" : cls?.department === "ME" ? "ME" : "CE";
  const names: Record<string, string> = {
    CS: "Core Computer Science",
    EC: "Core Electronics",
    ME: "Core Mechanical",
    CE: "Core Civil",
  };
  return [1, 2, 3, 4, 5].map((index) => ({
    code: `${prefix}${200 + index}`,
    name: `${names[prefix]} ${index}`,
    facultyName: "Department Faculty",
  }));
}
