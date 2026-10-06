import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { useCurrentUser, useNotificationsV2, useRole, setRole, type Role } from "../../services/mockService";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Academic and exam-duty overview" },
  "/students": { title: "My Students", subtitle: "Students and results for your subjects" },
  "/exam-duties": { title: "Exam Duties", subtitle: "Browse and select available duties" },
  "/assignments": { title: "My Assignments", subtitle: "Your exam duty assignments" },
  "/duty-history": { title: "Duty History", subtitle: "Your exam duty history across terms" },
  "/subjects": { title: "My Subjects", subtitle: "Subjects assigned to you" },
  "/performance": { title: "Student Performance", subtitle: "Authorized academic performance view" },
  "/class-advisor": { title: "Class Advisor", subtitle: "Your advisor class overview" },
  "/notifications": { title: "Notifications", subtitle: "Portal announcements and alerts" },
  "/hod": { title: "HOD Dashboard", subtitle: "Department overview - CSE" },
  "/hod/faculty": { title: "Faculty", subtitle: "Faculty in your department" },
  "/hod/classes": { title: "Classes", subtitle: "Classes and class advisors" },
  "/hod/exam-duties": { title: "Exam Duties", subtitle: "Department exam duties and coverage" },
  "/hod/performance": { title: "Department Performance", subtitle: "Performance across department subjects" },
  "/hod/reports": { title: "Reports", subtitle: "Department reports" },
  "/admin": { title: "Admin Dashboard", subtitle: "Institution-wide overview" },
  "/admin/faculty": { title: "Faculty", subtitle: "Manage faculty records" },
  "/admin/departments": { title: "Departments", subtitle: "Departments and HODs" },
  "/admin/classes": { title: "Classes", subtitle: "All classes and advisors" },
  "/admin/subjects": { title: "Subjects", subtitle: "Subject catalog" },
  "/admin/exam-duties": { title: "Exam Duties", subtitle: "Duty lifecycle management" },
  "/admin/allocations": { title: "Allocations", subtitle: "Auto-allocation runs and results" },
  "/admin/workload": { title: "Workload Policy", subtitle: "Duty obligations by designation" },
  "/admin/reports": { title: "Reports", subtitle: "Institution reports" },
  "/admin/audit": { title: "Audit Logs", subtitle: "System activity trail" },
};

const roleLabels: Record<Role, string> = {
  FACULTY: "Faculty",
  HOD: "HOD",
  ADMIN: "Admin",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((part) => /^[A-Z]/.test(part))
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = useRole();
  const user = useCurrentUser();
  const notifications = useNotificationsV2();
  const unreadCount = notifications.filter((item) => !item.read).length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const meta = pageTitles[pathname] ?? { title: "Faculty Portal" };

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-4 border-b border-line bg-surface px-4 sm:px-6">
      <button
        aria-label="Open navigation"
        className="grid size-9 place-items-center rounded-md text-muted hover:bg-canvas md:hidden"
        onClick={onOpenMobile}
        type="button"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-ink">{meta.title}</h1>
        {meta.subtitle && <p className="hidden truncate text-xs text-muted sm:block">{meta.subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div
          aria-label="Demo role switcher"
          className="hidden items-center gap-1 rounded-md border border-line bg-canvas p-1 sm:flex"
          title="Demo only: switch role to preview each experience"
        >
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Demo</span>
          {(Object.keys(roleLabels) as Role[]).map((option) => (
            <button
              className={`rounded px-2.5 py-1 text-xs font-medium ${
                role === option ? "bg-teal text-white" : "text-muted hover:text-ink"
              }`}
              key={option}
              onClick={() => setRole(option)}
              type="button"
            >
              {roleLabels[option]}
            </button>
          ))}
        </div>
        <button
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="relative grid size-9 place-items-center rounded-md text-muted hover:bg-canvas hover:text-ink"
          onClick={() => navigate("/notifications")}
          type="button"
        >
          <Bell aria-hidden="true" size={18} />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-coral ring-2 ring-surface"
            />
          )}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-canvas"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-teal/15 text-xs font-semibold text-teal-deep"
            >
              {initials(user.name)}
            </span>
            <span className="hidden text-sm font-medium sm:block">{user.name}</span>
            <ChevronDown aria-hidden="true" size={14} className="text-muted" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-line bg-surface p-4 shadow-lg"
              role="menu"
            >
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="mt-0.5 text-xs text-muted">{user.designation}</p>
              <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Employee ID</dt>
                  <dd className="font-medium">{user.employeeId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Department</dt>
                  <dd className="text-right font-medium">{user.department}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Email</dt>
                  <dd className="truncate font-medium">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Portal role</dt>
                  <dd className="font-medium">{roleLabels[user.role]}</dd>
                </div>
              </dl>
              <div className="mt-3 border-t border-line pt-3 sm:hidden">
                <p className="mb-1.5 text-[11px] font-semibold uppercase text-muted">Demo role</p>
                <div className="flex gap-1">
                  {(Object.keys(roleLabels) as Role[]).map((option) => (
                    <button
                      className={`flex-1 rounded border px-2 py-1 text-xs font-medium ${
                        role === option ? "border-teal bg-teal text-white" : "border-line text-muted"
                      }`}
                      key={option}
                      onClick={() => setRole(option)}
                      type="button"
                    >
                      {roleLabels[option]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
