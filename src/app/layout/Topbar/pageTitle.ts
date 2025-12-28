export type AdminPageMeta = {
  title: string;
  description: string;
};

type MetaRule = {
  startsWith: string;
  meta: AdminPageMeta;
};

const rules: MetaRule[] = [
  {
    startsWith: "/admin/dashboard",
    meta: {
      title: "Dashboard",
      description: "Manage and monitor your platform",
    },
  },
  {
    startsWith: "/admin/users",
    meta: {
      title: "Users",
      description: "Manage admins, teachers, and students accounts",
    },
  },
  {
    startsWith: "/admin/content",
    meta: {
      title: "Content",
      description: "Create, organize, and publish learning content",
    },
  },
  {
    startsWith: "/admin/live-classes",
    meta: {
      title: "Live Classes",
      description: "Schedule sessions, manage instructors, and track attendance",
    },
  },
  {
    startsWith: "/admin/books",
    meta: {
      title: "Books",
      description: "Manage book library, uploads, and access control",
    },
  },
  {
    startsWith: "/admin/payments",
    meta: {
      title: "Payments",
      description: "Track transactions, subscriptions, and payout status",
    },
  },
  {
    startsWith: "/admin/settings",
    meta: {
      title: "Settings",
      description: "Configure platform preferences, roles, and policies",
    },
  },
];

export function getAdminPageMeta(pathname: string): AdminPageMeta {
  const hit = rules
    .filter((r) => pathname.startsWith(r.startsWith))
    .sort((a, b) => b.startsWith.length - a.startsWith.length)[0];

  return (
    hit?.meta ?? {
      title: "Admin",
      description: "Manage your platform settings and operations",
    }
  );
}
export function getAdminPageTitle(pathname: string) {
  return getAdminPageMeta(pathname).title;
}
