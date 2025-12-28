import React from "react";
import PageContainer from "../../app/ui/PageContainer";
import { Button, EmptyState } from "../../app/shared";
import { useDashboardData } from "./useDashboardData";

import KpiGrid from "./components/KpiGrid";
import ChartCard from "./components/ChartCard";
import DashboardSkeleton from "./components/DashboardSkeleton";

import EngagementLineChart from "./components/charts/EngagementLineChart";
import RevenueBarChart from "./components/charts/RevenueBarChart";

import TopCoursesTable from "./components/TopCoursesTable";
import RecentPaymentsTable from "./components/RecentPaymentsTable";
import LiveTodayList from "./components/LiveTodayList";

const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useDashboardData("7d");

  return (
    <PageContainer>
      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <EmptyState
          title="Dashboard failed to load"
          description={error}
          action={
            <Button onClick={refresh}>
              Retry
            </Button>
          }
        />
      ) : data ? (
        <div className="space-y-6">
          {/* Refresh button*/}
          <div className="flex justify-end">
        <Button variant="outline" onClick={refresh}>
          Refresh
        </Button>
        </div>
          {/* KPIs */}
          <KpiGrid summary={data.summary} />

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Engagement" description="Active users & watch minutes">
              <EngagementLineChart data={data.trend} />
            </ChartCard>

            <ChartCard title="Revenue" description="Books + plans trend">
              <RevenueBarChart data={data.trend} />
            </ChartCard>
          </div>

          {/* Tables + List */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Top Courses" description="Highest impact courses this period">
              <TopCoursesTable rows={data.topCourses} />
            </ChartCard>

            <ChartCard title="Live Classes Today" description="Sessions and attendance">
              <LiveTodayList rows={data.liveToday} />
            </ChartCard>
          </div>

          <ChartCard title="Recent Payments" description="Latest transactions">
            <RecentPaymentsTable rows={data.recentPayments} />
          </ChartCard>
        </div>
      ) : null}
    </PageContainer>
  );
};

export default DashboardPage;
