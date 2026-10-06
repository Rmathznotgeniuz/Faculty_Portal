import { EmptyState, PageHeader } from "../components/common/States";
import { notificationCategoryLabel } from "../components/common/StatusBadge";
import { notificationService } from "../services/portalService";

export default function NotificationsPage() {
  const notifications = notificationService.useNotifications();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader subtitle="Portal announcements and alerts." title="Notifications" />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications." />
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              className={`flex items-start gap-4 rounded-lg border bg-surface p-5 shadow-sm ${
                notification.read ? "border-line" : "border-teal/30"
              }`}
              key={notification.id}
            >
              <span
                aria-label={notification.read ? "Read" : "Unread"}
                aria-hidden="true"
                className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? "bg-line" : "bg-coral"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm ${notification.read ? "text-muted" : "font-semibold text-ink"}`}>
                    {notification.title}
                  </p>
                  <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
                    {notificationCategoryLabel[notification.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">{notification.message}</p>
                <p className="mt-2 text-[11px] text-muted">{notification.timestamp.replace("T", " ")}</p>
              </div>
              {!notification.read && (
                <button
                  className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
                  onClick={() => notificationService.markAsRead(notification.id)}
                  type="button"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
