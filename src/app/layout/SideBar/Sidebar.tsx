import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { NAV_ITEMS } from "./nav.config";
import { cn } from "../../utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const Sidebar: React.FC<Props> = ({ open, onClose, onLogout }) => {
  const closeIfMobile = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) onClose();
  };

  return (
    <>
      {/* Mobile / Tablet overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh min-h-0 flex-col border-r border-slate-200 bg-white",
          "w-[280px] max-w-[85vw] transition-transform duration-200 ease-out",
          "lg:w-[280px] lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        role="navigation"
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Wisdom Admin logo"
              className="h-10 w-10 flex-none rounded-2xl object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">Wisdom Weavers Admin</p>
              <p className="truncate text-xs font-semibold text-slate-500">Control Center</p>
            </div>
          </div>

          <button
            className="flex-none rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === "/admin/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-[#13334c] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  )
                }
                onClick={closeIfMobile}
              >
                <span className={cn("flex-none text-slate-500 transition-colors", "group-[.active]:text-white")}>
                  {item.icon}
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 py-4">
          <button
            onClick={onLogout}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            )}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
