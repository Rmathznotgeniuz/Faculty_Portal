import { NavLink } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  ClipboardCheck,
  FileBarChart,
  FileClock,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogOut,
  School,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useCurrentUser, useRole } from "../../services/mockService";
import { logout } from "../../auth/keycloak";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const facultyNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "My Students", icon: Users },
  { to: "/subjects", label: "My Subjects", icon: BookOpen },
  { to: "/performance", label: "Student Performance", icon: GraduationCap },
  { to: "/class-advisor", label: "Class Advisor", icon: School },
  { to: "/exam-duties", label: "Exam Duties", icon: ClipboardList },
  { to: "/assignments", label: "My Assignments", icon: CalendarCheck },
  { to: "/duty-history", label: "Duty History", icon: FileClock },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const hodNav: NavItem[] = [
  { to: "/hod", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hod/faculty", label: "Faculty", icon: Users },
  { to: "/hod/classes", label: "Classes", icon: Layers },
  { to: "/hod/exam-duties", label: "Exam Duties", icon: ClipboardList },
  { to: "/hod/performance", label: "Department Performance", icon: GraduationCap },
  { to: "/hod/reports", label: "Reports", icon: FileBarChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/faculty", label: "Faculty", icon: Users },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/classes", label: "Classes", icon: Layers },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/exam-duties", label: "Exam Duties", icon: ClipboardList },
  { to: "/admin/allocations", label: "Allocations", icon: ListChecks },
  { to: "/admin/workload", label: "Workload Policy", icon: ClipboardCheck },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const navByRole = { FACULTY: facultyNav, HOD: hodNav, ADMIN: adminNav } as const;

const secondaryNav: NavItem[] = [
  { to: "/help", label: "Help", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount: number;
};

function NavButton({
  item,
  collapsed,
  badge,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      className={({ isActive }) =>
        `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
          isActive ? "bg-teal/10 text-teal-deep" : "text-muted hover:bg-canvas hover:text-ink"
        } ${collapsed ? "justify-center px-0" : ""}`
      }
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      to={item.to}
    >
      <span className="relative shrink-0">
        <Icon aria-hidden="true" size={18} />
        {badge !== undefined && badge > 0 && (
          <span
            aria-label={`${badge} unread`}
            className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-coral text-[9px] font-semibold text-white"
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile, unreadCount }: SidebarProps) {
  const role = useRole();
  const user = useCurrentUser();
  const primaryNav = navByRole[role];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-[width,transform] duration-200 md:translate-x-0 ${
        collapsed ? "w-[76px]" : "w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="flex h-[76px] items-center gap-3 border-b border-line px-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-deep text-white">
          <GraduationCap aria-hidden="true" size={20} strokeWidth={1.8} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Faculty Portal</p>
            <p className="text-xs text-muted">{user.department}</p>
          </div>
        )}
        <button
          aria-label="Close navigation"
          className="ml-auto grid size-8 place-items-center rounded-md text-muted hover:bg-canvas md:hidden"
          onClick={onCloseMobile}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-muted">Workspace</p>
        )}
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavButton
              badge={item.to === "/notifications" ? unreadCount : undefined}
              collapsed={collapsed}
              item={item}
              key={item.to}
              onNavigate={onCloseMobile}
            />
          ))}
        </div>
        <div className="my-4 border-t border-line" />
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-muted">General</p>
        )}
        <div className="space-y-1">
          {secondaryNav.map((item) => (
            <NavButton collapsed={collapsed} item={item} key={item.to} onNavigate={onCloseMobile} />
          ))}
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div
          className={`flex items-center gap-3 rounded-md p-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-teal/15 text-sm font-semibold text-teal-deep"
          >
            {user.name
              .split(" ")
              .filter((part) => /^[A-Z]/.test(part))
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.designation}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <p className="mb-2 mt-1 truncate px-3 text-[11px] text-muted">{user.department}</p>
        )}
        <button
          className={`flex h-9 w-full items-center gap-3 rounded-md text-sm text-muted hover:bg-canvas hover:text-ink ${
            collapsed ? "justify-center" : "px-3"
          }`}
          title={collapsed ? "Logout" : undefined}
          onClick={() => void logout()}
          type="button"
        >
          <LogOut aria-hidden="true" size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
