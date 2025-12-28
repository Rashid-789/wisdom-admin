export const paths = {
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",

    users: {
      root: "/admin/users",
      students: "/admin/users/students",
      teachers: "/admin/users/teachers",
      admins: "/admin/users/admins",
      detail: (id: string) => `/admin/users/${id}`,
    },

    content: {
      root: "/admin/content",
      subjects: "/admin/content/subjects",
      courses: "/admin/content/courses",
      courseDetail: (courseId: string) => `/admin/content/courses/${courseId}`,
      lectures: "/admin/content/lectures",
      exercises: "/admin/content/exercises",
    },

    live: {
      root: "/admin/live-classes",
      list: "/admin/live-classes",
      calendar: "/admin/live-classes/calendar",
      detail: (id: string) => `/admin/live-classes/${id}`,
    },
    // Alias for live classes for clarity in pages
    liveClasses: {
      root: "/admin/live-classes",
      list: "/admin/live-classes",
      calendar: "/admin/live-classes/calendar",
      detail: (id: string) => `/admin/live-classes/${id}`,
    },

    books: {
      root: "/admin/books",
      list: "/admin/books",
      orders: "/admin/books/orders",
      detail: (id: string) => `/admin/books/${id}`,
    },

    payments: {
      root: "/admin/payments",
      transactions: "/admin/payments/transactions",
      plans: "/admin/payments/plans",
      refunds: "/admin/payments/refunds",
    },

    settings: {
      root: "/admin/settings",
      account: "/admin/settings/account",
      app: "/admin/settings/app",
      notifications: "/admin/settings/notifications",
      auditLogs: "/admin/settings/audit-logs",
    },
  },
} as const;
