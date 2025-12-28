
import React from "react";
import { Users, UserCheck, Activity, Clock, Coins, CreditCard, Video } from "lucide-react";
import type { DashboardSummary } from "../Types/dashboard.types";
import KpiCard from "./KpiCard";

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

function formatMinutes(min: number) {
  // keep it compact for admin KPI
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatMoney(value: number, currency = "PKR") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

type Props = {
  summary: DashboardSummary;
};

const KpiGrid: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total Students" value={formatCompact(summary.totalStudents)} right={<Users size={18} className="text-slate-700" />} />
      <KpiCard label="Total Teachers" value={formatCompact(summary.totalTeachers)} right={<UserCheck size={18} className="text-slate-700" />} />
      <KpiCard label="Active Today" value={formatCompact(summary.activeToday)} right={<Activity size={18} className="text-slate-700" />} />
      <KpiCard label="Completion Rate" value={`${summary.completionRate}%`} hint="Avg topics/exercises" right={<Video size={18} className="text-slate-700" />} />

      <KpiCard label="Watch Time" value={formatMinutes(summary.watchMinutes)} hint="Selected range" right={<Clock size={18} className="text-slate-700" />} />
      <KpiCard
        label="Tokens"
        value={`${formatCompact(summary.tokensEarned)} / ${formatCompact(summary.tokensSpent)}`}
        hint="Earned / Spent"
        right={<Coins size={18} className="text-slate-700" />}
      />
      <KpiCard
        label="Revenue"
        value={formatMoney(summary.revenue, "PKR")}
        hint="Books + plans"
        right={<CreditCard size={18} className="text-slate-700" />}
      />
      <KpiCard
        label="Live Today"
        value={`${summary.liveTodayCount} sessions`}
        hint={`${summary.liveTodayAttendance} attendance`}
        right={<Video size={18} className="text-slate-700" />}
      />
    </div>
  );
};

export default KpiGrid;
