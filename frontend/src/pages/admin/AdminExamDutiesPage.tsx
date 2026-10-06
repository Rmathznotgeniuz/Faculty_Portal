import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/common/States";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  assignDutyManually,
  createDuty,
  setDutyStatus,
  useAdminDuties,
  useFacultyDirectory,
} from "../../services/mockService";

const lifecycleTone = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "neutral",
  CANCELLED: "error",
} as const;

export default function AdminExamDutiesPage() {
  const duties = useAdminDuties();
  const faculty = useFacultyDirectory();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignee, setAssignee] = useState("");
  const [reason, setReason] = useState("");

  const filtered = useMemo(
    () =>
      duties
        .filter((duty) => status === "all" || duty.status === status)
        .filter(
          (duty) =>
            duty.subjectName.toLowerCase().includes(query.toLowerCase()) ||
            duty.subjectCode.toLowerCase().includes(query.toLowerCase()) ||
            duty.exam.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [duties, query, status],
  );

  const eligibleFaculty = faculty.filter(
    (member) =>
      member.status === "ACTIVE" &&
      member.designation !== "Professor" &&
      (assigning ? duties.find((duty) => duty.id === assigning)?.eligibleDepartments.includes(member.department) : false),
  );

  return (
    <div>
      <PageHeader subtitle="Create duties, manage lifecycle, and assign faculty manually." title="Exam Duties" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 text-muted" size={16} />
          <input
            className="h-9 w-56 rounded-md border border-line bg-surface pl-8 pr-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject or exam"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by status"
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="FULL">Full</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-deep"
          onClick={() => setCreating(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={14} /> New duty
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Exam</th>
              <th className="px-4 py-2.5 font-medium">Subject</th>
              <th className="px-4 py-2.5 font-medium">Venue</th>
              <th className="px-4 py-2.5 font-medium">Assigned</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((duty) => (
              <tr className="border-t border-line" key={duty.id}>
                <td className="whitespace-nowrap px-4 py-2.5">{duty.date}</td>
                <td className="px-4 py-2.5">{duty.exam}</td>
                <td className="px-4 py-2.5 font-medium">
                  {duty.subjectCode} {duty.subjectName}
                </td>
                <td className="px-4 py-2.5">{duty.venue}</td>
                <td className="px-4 py-2.5">
                  {duty.assigned}/{duty.capacity}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={lifecycleTone[duty.status]}>{duty.status}</StatusBadge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {duty.status === "OPEN" && (
                      <>
                        <button
                          className="font-medium text-teal-deep hover:underline"
                          onClick={() => setDutyStatus(duty.id, "CLOSED")}
                          type="button"
                        >
                          Close
                        </button>
                        <button
                          className="font-medium text-coral hover:underline"
                          onClick={() => setDutyStatus(duty.id, "CANCELLED")}
                          type="button"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {(duty.status === "CLOSED" || duty.status === "FULL") && (
                      <button
                        className="font-medium text-teal-deep hover:underline"
                        onClick={() => setDutyStatus(duty.id, "OPEN")}
                        type="button"
                      >
                        Reopen
                      </button>
                    )}
                    {duty.status !== "CANCELLED" && duty.assigned < duty.capacity && (
                      <button
                        className="font-medium text-teal-deep hover:underline"
                        onClick={() => {
                          setAssigning(duty.id);
                          setAssignee("");
                          setReason("");
                        }}
                        type="button"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30" role="dialog" aria-modal="true">
          <button aria-label="Close dialog" className="absolute inset-0" onClick={() => setCreating(false)} type="button" />
          <div className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
            <h2 className="font-serif text-lg font-semibold">Create exam duty</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2 block">
                <span className="text-xs text-muted">Exam</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="End Semester" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Subject code</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="CS401" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Subject name</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="Machine Learning" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Date</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="2026-01-12" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Time</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="09:30 - 12:30" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Venue</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="Main Hall A" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Capacity</span>
                <input className="mt-1 h-9 w-full rounded-md border border-line px-3" defaultValue="4" type="number" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-canvas" onClick={() => setCreating(false)} type="button">
                Cancel
              </button>
              <button
                className="rounded-md bg-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-deep"
                onClick={() => {
                  createDuty({
                    exam: "End Semester",
                    subjectCode: "CS401",
                    subjectName: "Machine Learning",
                    date: "2026-01-12",
                    time: "09:30 - 12:30",
                    venue: "Main Hall A",
                    capacity: 4,
                    eligibleDepartments: ["CSE"],
                    eligibleDesignations: ["Assistant Professor", "Associate Professor"],
                    selectionOpens: "2026-01-02",
                    selectionCloses: "2026-01-08",
                  });
                  setCreating(false);
                }}
                type="button"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {assigning && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30" role="dialog" aria-modal="true">
          <button aria-label="Close dialog" className="absolute inset-0" onClick={() => setAssigning(null)} type="button" />
          <div className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
            <h2 className="font-serif text-lg font-semibold">Assign faculty manually</h2>
            <p className="mt-1 text-xs text-muted">Assignment type will be recorded as ADMIN_ASSIGNED.</p>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs text-muted">Faculty</span>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-line px-3"
                  onChange={(event) => setAssignee(event.target.value)}
                  value={assignee || eligibleFaculty[0]?.id || ""}
                >
                  {eligibleFaculty.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.designation})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Reason</span>
                <textarea
                  className="mt-1 w-full rounded-md border border-line p-2 text-sm"
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Why is this manual assignment needed?"
                  rows={3}
                  value={reason}
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-canvas" onClick={() => setAssigning(null)} type="button">
                Cancel
              </button>
              <button
                className="rounded-md bg-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-deep"
                onClick={() => {
                  const facultyId = assignee || eligibleFaculty[0]?.id;
                  if (facultyId) assignDutyManually(assigning, facultyId, reason || "Manual assignment by admin");
                  setAssigning(null);
                }}
                type="button"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
