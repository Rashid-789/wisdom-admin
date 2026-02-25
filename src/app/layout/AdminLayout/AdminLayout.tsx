import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../SideBar/Sidebar";
import Topbar from "../Topbar/Topbar";
import { useAdminAuth } from "../../../auth/useAdminAuth";

/**
 * Minimal, dependency-free media query hook.
 * Keeps the layout responsive without touching Sidebar/Topbar internals.
 */
function useMediaQuery(query: string) {
  const getMatch = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = React.useState(getMatch);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    setMatches(mql.matches);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query, getMatch]);

  return matches;
}

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { session, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tailwind "lg" breakpoint is 1024px by default
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // On desktop, sidebar should always be visible. On smaller screens it's toggleable.
  const sidebarVisible = isDesktop || sidebarOpen;

  const user = React.useMemo(
    () => ({
      uid: session?.user.uid ?? "admin",
      name: session?.user.name ?? session?.user.displayName ?? "Admin",
      email: session?.user.email ?? "admin@domain.com",
      displayName: session?.user.displayName ?? "Admin",
      role: session?.user.role ?? "admin",
      avatarUrl: session?.user.avatarUrl ?? undefined,
    }),
    [session]
  );

  // Close the mobile sidebar when the route changes (typical responsive behavior)
  React.useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50">
      <div className="flex h-full w-full">
        <Sidebar
          open={sidebarVisible}
          onClose={() => {
            if (!isDesktop) setSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />

        {/* Padding only applies on large screens where sidebar is docked */}
        <div className="flex h-full flex-1 min-h-0 min-w-0 flex-col lg:pl-[280px]">
          <Topbar
            onOpenSidebar={() => {
              if (!isDesktop) setSidebarOpen(true);
            }}
            user={user}
          />

          <main className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
