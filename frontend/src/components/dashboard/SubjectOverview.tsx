import { Link } from "react-router-dom";
import { facultyService } from "../../services/portalService";

export function SubjectOverview() {
  const subjects = facultyService.getSubjects();

  return (
    <section aria-labelledby="subject-overview-heading" className="rounded-lg border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold" id="subject-overview-heading">
          My Subjects
        </h2>
        <Link className="text-xs font-medium text-teal-deep hover:underline" to="/subjects">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {subjects.map((subject) => (
          <li className="flex items-center justify-between gap-4 px-5 py-3.5" key={subject.id}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {subject.code} - {subject.name}
              </p>
              <p className="text-xs text-muted">{subject.className}</p>
            </div>
            <p className="shrink-0 text-xs text-muted">{subject.studentCount} students</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
