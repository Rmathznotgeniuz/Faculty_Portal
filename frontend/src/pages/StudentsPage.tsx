import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PageHeader } from "../components/common/States";
import { StatusBadge } from "../components/common/StatusBadge";
import {
  useCurrentUser,
  useFacultyTeachingSubjects,
  useStudentResults,
  useStudentsForClass,
} from "../services/mockService";
import type { StudentRecord, StudentSubjectResult } from "../mock/types";

type SortKey = "name" | "rollNumber" | "attendance" | "total";

function riskOf(student: StudentRecord, results: StudentSubjectResult[]) {
  if (results.some((result) => result.grade === "F")) return { label: "Failed", tone: "error" as const };
  if (student.attendance < 75) return { label: "Low attendance", tone: "warning" as const };
  const average = results.reduce((sum, result) => sum + result.total, 0) / Math.max(results.length, 1);
  if (average >= 75) return { label: "Excellent", tone: "success" as const };
  if (average >= 55) return { label: "Average", tone: "info" as const };
  return { label: "At risk", tone: "warning" as const };
}

function StudentDrawer({
  student,
  results,
  onClose,
}: {
  student: StudentRecord;
  results: StudentSubjectResult[];
  onClose: () => void;
}) {
  const average = results.reduce((sum, result) => sum + result.total, 0) / Math.max(results.length, 1);
  const risk = riskOf(student, results);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" role="dialog" aria-modal="true">
      <button aria-label="Close student details" className="flex-1" onClick={onClose} type="button" />
      <div className="h-full w-full max-w-lg overflow-y-auto bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold">{student.name}</h2>
            <p className="text-xs text-muted">
              {student.registerNumber} - Roll {student.rollNumber} - {student.className}
            </p>
          </div>
          <button
            aria-label="Close"
            className="grid size-8 place-items-center rounded-md text-muted hover:bg-canvas"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] uppercase text-muted">Attendance</p>
            <p className="text-lg font-semibold">{student.attendance.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] uppercase text-muted">Average</p>
            <p className="text-lg font-semibold">{average.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="text-[11px] uppercase text-muted">Status</p>
            <div className="mt-1">
              <StatusBadge tone={risk.tone}>{risk.label}</StatusBadge>
            </div>
          </div>
        </div>
        <h3 className="mt-6 text-sm font-semibold">Subject-wise marks</h3>
        <div className="mt-2 overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-2 py-2 font-medium">Int</th>
                <th className="px-2 py-2 font-medium">Asg</th>
                <th className="px-2 py-2 font-medium">Mid</th>
                <th className="px-2 py-2 font-medium">Final</th>
                <th className="px-2 py-2 font-medium">Total</th>
                <th className="px-2 py-2 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr className="border-t border-line" key={result.subjectCode}>
                  <td className="px-3 py-2 font-medium">{result.subjectName}</td>
                  <td className="px-2 py-2">{result.internal}</td>
                  <td className="px-2 py-2">{result.assignment}</td>
                  <td className="px-2 py-2">{result.midterm}</td>
                  <td className="px-2 py-2">{result.final}</td>
                  <td className="px-2 py-2 font-semibold">{result.total}</td>
                  <td className="px-2 py-2">
                    <StatusBadge tone={result.grade === "F" ? "error" : result.grade === "O" ? "success" : "info"}>
                      {result.grade}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const user = useCurrentUser();
  const subjects = useFacultyTeachingSubjects(user.facultyId ?? "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rollNumber");
  const [selected, setSelected] = useState<StudentRecord | null>(null);

  const subject = subjects.find((item) => item.id === subjectId);
  const roster = useStudentsForClass(subject?.classId ?? "");

  const rows = useMemo(() => {
    const mapped = roster
      .filter(
        (student) =>
          student.name.toLowerCase().includes(query.toLowerCase()) || student.registerNumber.includes(query),
      )
      .map((student) => ({
        student,
        results: useStudentResults(student, [
          { code: subject?.code ?? "", name: subject?.name ?? "", facultyName: user.name },
        ]),
      }));
    const totalOf = (entry: (typeof mapped)[number]) =>
      entry.results.reduce((sum, result) => sum + result.total, 0) / Math.max(entry.results.length, 1);
    return mapped.sort((a, b) => {
      if (sortKey === "name") return a.student.name.localeCompare(b.student.name);
      if (sortKey === "attendance") return a.student.attendance - b.student.attendance;
      if (sortKey === "total") return totalOf(b) - totalOf(a);
      return a.student.rollNumber - b.student.rollNumber;
    });
  }, [roster, query, sortKey, subject, user.name]);

  return (
    <div>
      <PageHeader subtitle="Students enrolled in your subjects, with marks and attendance." title="My Students" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted" htmlFor="subject-select">
          Subject
        </label>
        <select
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          id="subject-select"
          onChange={(event) => setSubjectId(event.target.value)}
          value={subjectId}
        >
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} {item.name} - {item.className}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 text-muted" size={16} />
          <input
            className="h-9 w-56 rounded-md border border-line bg-surface pl-8 pr-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or register no."
            value={query}
          />
        </div>
        <select
          aria-label="Sort students"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          value={sortKey}
        >
          <option value="rollNumber">Sort: Roll no.</option>
          <option value="name">Sort: Name</option>
          <option value="attendance">Sort: Attendance (low first)</option>
          <option value="total">Sort: Total marks</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Register No.</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Roll</th>
              <th className="px-4 py-2.5 font-medium">Attendance</th>
              <th className="px-4 py-2.5 font-medium">Internal</th>
              <th className="px-4 py-2.5 font-medium">Midterm</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Grade</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, results }) => {
              const primary = results[0];
              const risk = riskOf(student, results);
              return (
                <tr
                  className="cursor-pointer border-t border-line hover:bg-canvas"
                  key={student.id}
                  onClick={() => setSelected(student)}
                >
                  <td className="px-4 py-2.5 font-mono text-xs">{student.registerNumber}</td>
                  <td className="px-4 py-2.5 font-medium">{student.name}</td>
                  <td className="px-4 py-2.5">{student.rollNumber}</td>
                  <td className="px-4 py-2.5">{student.attendance.toFixed(0)}%</td>
                  <td className="px-4 py-2.5">{primary?.internal ?? "-"}</td>
                  <td className="px-4 py-2.5">{primary?.midterm ?? "-"}</td>
                  <td className="px-4 py-2.5 font-semibold">{primary?.total ?? "-"}</td>
                  <td className="px-4 py-2.5">{primary?.grade ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={risk.tone}>{risk.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && subject && (
        <StudentDrawer
          onClose={() => setSelected(null)}
          results={useStudentResults(selected, [
            { code: subject.code, name: subject.name, facultyName: user.name },
          ])}
          student={selected}
        />
      )}
    </div>
  );
}
