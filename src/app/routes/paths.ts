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
      basicCourses: "/admin/content/basic-courses",
      skillCourses: "/admin/content/skill-courses",
      courseDetail: (courseId: string) => `/admin/content/courses/${courseId}`,
      chapterDetail: (courseId: string, chapterId: string) =>
        `/admin/content/courses/${courseId}/chapters/${chapterId}`,

      // Legacy routes kept for compatibility with older files.
      basicSubjects: "/admin/content/basic-subjects",
      basicSubjectDetail: (subjectId: string) => `/admin/content/basic-subjects/${subjectId}`,
      skillSubjects: "/admin/content/skill-subjects",
      skillSubjectDetail: (subjectId: string) => `/admin/content/skill-subjects/${subjectId}`,
      courses: "/admin/content/courses",
    },

    liveClasses: {
      root: "/admin/live-classes",
      list: "/admin/live-classes",
      calendar: "/admin/live-classes/calendar",
      detail: (id: string) => `/admin/live-classes/${id}`,
    },

    books: {
      list: "/admin/books",
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
      notifications: "/admin/settings/notifications",
    },
  },
} as const;
