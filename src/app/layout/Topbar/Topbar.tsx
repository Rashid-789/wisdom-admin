import React from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getAdminPageMeta } from "./pageTitle";
import type { AdminUser } from "../../auth/useAdminSession";
import TopbarUserBadge from "./TopbarUserBadge";

import NotificationBell from "../../../notifications/NotificationBell";
import NotificationsPopover from "../../../notifications/NotificationsPopover";
import { useNotifications } from "../../../notifications/useNotifications";

type Props = {
  onOpenSidebar: () => void;
  user: AdminUser;
};

const Topbar: React.FC<Props> = ({ onOpenSidebar, user }) => {
  const location = useLocation();
  const { title, description } = React.useMemo(
    () => getAdminPageMeta(location.pathname),
    [location.pathname]
  );

  const [notifOpen, setNotifOpen] = React.useState(false);
  const {
    items,
    unreadCount,
    loading,
    markAllRead,
    markRead,
    removeNotification,
    refresh,
  } = useNotifications();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left side should shrink nicely */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex-none rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{title}</p>
            {description ? <p className="truncate text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>

        {/* Right side must NOT cause overflow */}
        <div className="flex flex-none items-center gap-2">
          <div className="relative hidden sm:block" />

          {/* Notifications */}
          <div className="relative flex-none">
            <NotificationBell
              unreadCount={unreadCount}
              open={notifOpen}
              onToggle={() => setNotifOpen((v) => !v)}
            />

            <NotificationsPopover
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              loading={loading}
              items={items}
              onMarkAllRead={markAllRead}
              onMarkRead={markRead}
              onRemove={removeNotification}
              onRefresh={refresh}
            />
          </div>

          <TopbarUserBadge user={user} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
