
export type TimeRange = "7d" | "30d";

export type TrendPoint = {
  date: string; // e.g. "Dec 01"
  activeUsers: number;
  watchMinutes: number;
  completionRate: number; // 0-100
  revenue: number; // numeric (e.g. 1200.5)
  tokensEarned: number;
  tokensSpent: number;
};

export type DashboardSummary = {
  totalStudents: number;
  totalTeachers: number;
  activeToday: number;

  completionRate: number; // %
  watchMinutes: number; // total in selected range

  tokensEarned: number; // total in selected range
  tokensSpent: number; // total in selected range

  revenue: number; // total in selected range
  liveTodayCount: number;
  liveTodayAttendance: number;
};

export type TopCourse = {
  id: string;
  title: string;
  gradeLabel?: string; // e.g. "Grade 8–9"
  enrolled: number;
  completionRate: number; // 0-100
  watchMinutes: number;
};

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type RecentPayment = {
  id: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string; // "USD" | "GBP" etc
  status: PaymentStatus;
  createdAt: string; // ISO
};

export type LiveStatus = "scheduled" | "live" | "ended";

export type LiveSessionToday = {
  id: string;
  title: string;
  teacherName: string;
  startTime: string; // ISO
  endTime: string; // ISO
  attendees: number;
  capacity: number;
  status: LiveStatus;
};

export type DashboardOverview = {
  range: TimeRange;
  summary: DashboardSummary;
  trend: TrendPoint[];
  topCourses: TopCourse[];
  recentPayments: RecentPayment[];
  liveToday: LiveSessionToday[];
};
