import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Video,
  CalendarClock,
  BookOpen,
  CreditCard,
  Settings,
} from "lucide-react";
import { paths } from "../../routes/paths";

export type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: ReactNode;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", to: paths.admin.dashboard, icon: <LayoutDashboard size={18} /> },
  { key: "users", label: "Users", to: paths.admin.users.root, icon: <Users size={18} /> },
  { key: "content", label: "Content", to: paths.admin.content.root, icon: <Video size={18} /> },
  { key: "live", label: "Live Classes", to: paths.admin.liveClasses.root, icon: <CalendarClock size={18} /> },
  { key: "books", label: "Books", to: paths.admin.books.root, icon: <BookOpen size={18} /> },
  { key: "payments", label: "Payments", to: paths.admin.payments.root, icon: <CreditCard size={18} /> },
  { key: "settings", label: "Settings", to: paths.admin.settings.root, icon: <Settings size={18} /> },
];
