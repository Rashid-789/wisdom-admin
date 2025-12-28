
import type {
  DashboardOverview,
  TimeRange,
  RecentPayment,
  LiveSessionToday,
} from "../Types/dashboard.types";

function iso(d: Date) {
  return d.toISOString();
}

export function buildDashboardMock(range: TimeRange): DashboardOverview {
  const now = new Date();

  const trend =
    range === "7d"
      ? [
          { date: "Mon", activeUsers: 180, watchMinutes: 5400, completionRate: 62, revenue: 320, tokensEarned: 900, tokensSpent: 760 },
          { date: "Tue", activeUsers: 210, watchMinutes: 6100, completionRate: 64, revenue: 410, tokensEarned: 980, tokensSpent: 820 },
          { date: "Wed", activeUsers: 240, watchMinutes: 7300, completionRate: 65, revenue: 390, tokensEarned: 1100, tokensSpent: 860 },
          { date: "Thu", activeUsers: 260, watchMinutes: 7900, completionRate: 66, revenue: 520, tokensEarned: 1200, tokensSpent: 920 },
          { date: "Fri", activeUsers: 300, watchMinutes: 8800, completionRate: 67, revenue: 610, tokensEarned: 1400, tokensSpent: 980 },
          { date: "Sat", activeUsers: 280, watchMinutes: 8200, completionRate: 66, revenue: 570, tokensEarned: 1320, tokensSpent: 960 },
          { date: "Sun", activeUsers: 220, watchMinutes: 6900, completionRate: 65, revenue: 450, tokensEarned: 1050, tokensSpent: 870 },
        ]
      : Array.from({ length: 12 }).map((_, i) => ({
          date: `W${i + 1}`,
          activeUsers: 180 + i * 12,
          watchMinutes: 5200 + i * 240,
          completionRate: 58 + Math.min(12, i),
          revenue: 280 + i * 45,
          tokensEarned: 900 + i * 90,
          tokensSpent: 750 + i * 70,
        }));

  const summary = {
    totalStudents: 12450,
    totalTeachers: 120,
    activeToday: 642,

    completionRate: Math.round(trend.reduce((a, b) => a + b.completionRate, 0) / trend.length),
    watchMinutes: trend.reduce((a, b) => a + b.watchMinutes, 0),

    tokensEarned: trend.reduce((a, b) => a + b.tokensEarned, 0),
    tokensSpent: trend.reduce((a, b) => a + b.tokensSpent, 0),

    revenue: trend.reduce((a, b) => a + b.revenue, 0),
    liveTodayCount: 6,
    liveTodayAttendance: 184,
  };

  const topCourses = [
    { id: "c1", title: "Applied Mathematics", gradeLabel: "Grade 8–9", enrolled: 3210, completionRate: 73, watchMinutes: 182340 },
    { id: "c2", title: "Physics", gradeLabel: "Grade 8–9", enrolled: 2870, completionRate: 68, watchMinutes: 164120 },
    { id: "c3", title: "Chemistry", gradeLabel: "Grade 8–9", enrolled: 2560, completionRate: 64, watchMinutes: 141880 },
    { id: "c4", title: "History", gradeLabel: "Grade 8–9", enrolled: 1980, completionRate: 59, watchMinutes: 99800 },
  ];

  const recentPayments: RecentPayment[] = [
    { id: "p1", userName: "John Doe", userEmail: "john@example.com", amount: 1500, currency: "PKR", status: "paid", createdAt: iso(new Date(now.getTime() - 1000 * 60 * 22)) },
    { id: "p2", userName: "Ayesha Khan", userEmail: "ayesha@example.com", amount: 299, currency: "PKR", status: "pending", createdAt: iso(new Date(now.getTime() - 1000 * 60 * 65)) },
    { id: "p3", userName: "Hamza Ali", userEmail: "hamza@example.com", amount: 1500, currency: "PKR", status: "failed", createdAt: iso(new Date(now.getTime() - 1000 * 60 * 140)) },
    { id: "p4", userName: "Sara Noor", userEmail: "sara@example.com", amount: 299, currency: "PKR", status: "paid", createdAt: iso(new Date(now.getTime() - 1000 * 60 * 240)) },
  ];

  const liveToday: LiveSessionToday[] = [
    {
      id: "l1",
      title: "Applied Mathematics — Calculus Intro",
      teacherName: "Mr. Ahmed",
      startTime: iso(new Date(now.getTime() + 1000 * 60 * 30)),
      endTime: iso(new Date(now.getTime() + 1000 * 60 * 90)),
      attendees: 52,
      capacity: 100,
      status: "scheduled",
    },
    {
      id: "l2",
      title: "Physics — Motion & Forces",
      teacherName: "Ms. Fatima",
      startTime: iso(new Date(now.getTime() - 1000 * 60 * 20)),
      endTime: iso(new Date(now.getTime() + 1000 * 60 * 40)),
      attendees: 68,
      capacity: 80,
      status: "live",
    },
    {
      id: "l3",
      title: "Chemistry — Atomic Structure",
      teacherName: "Mr. Bilal",
      startTime: iso(new Date(now.getTime() - 1000 * 60 * 150)),
      endTime: iso(new Date(now.getTime() - 1000 * 60 * 90)),
      attendees: 34,
      capacity: 60,
      status: "ended",
    },
  ];

  return {
    range,
    summary,
    trend,
    topCourses,
    recentPayments,
    liveToday,
  };
}
