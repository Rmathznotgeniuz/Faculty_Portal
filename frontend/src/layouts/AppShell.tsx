import { useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useNotificationsV2 } from "../services/mockService";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifications = useNotificationsV2();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        unreadCount={unreadCount}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          collapsed ? "md:pl-[76px]" : "md:pl-64"
        }`}
      >
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-line px-4 py-3 text-xs text-muted sm:px-6">
          Faculty Portal - {new Date().getFullYear()} | Prototype with mock data
        </footer>
      </div>

      <button
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="fixed bottom-4 z-30 hidden size-8 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm hover:text-ink md:grid"
        onClick={() => setCollapsed((value) => !value)}
        style={{ left: collapsed ? 44 : 232 }}
        type="button"
      >
        {collapsed ? (
          <PanelLeftOpen aria-hidden="true" size={15} />
        ) : (
          <PanelLeftClose aria-hidden="true" size={15} />
        )}
      </button>
    </div>
  );
}
