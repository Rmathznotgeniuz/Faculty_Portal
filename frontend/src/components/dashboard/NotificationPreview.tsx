import { Link } from "react-router-dom";
import { notificationCategoryLabel } from "../common/StatusBadge";
import { notificationService } from "../../services/portalService";
import { EmptyState } from "../common/States";

export function NotificationPreview() {
  const notifications = notificationService.useNotifications();
  const recent = notifications.slice(0, 4);

  return (
    <section aria-labelledby="notification-preview-heading" className="rounded-lg border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold" id="notification-preview-heading">
          Recent Notifications
        </h2>
        <Link className="text-xs font-medium text-teal-deep hover:underline" to="/notifications">
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No notifications." />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {recent.map((notification) => (
            <li className="flex items-start gap-3 px-5 py-3.5" key={notification.id}>
              <span
                aria-hidden="true"
                className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? "bg-line" : "bg-coral"}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${notification.read ? "text-muted" : "font-medium text-ink"}`}>
                  {notification.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {notificationCategoryLabel[notification.category]} - {notification.timestamp.slice(0, 10)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
