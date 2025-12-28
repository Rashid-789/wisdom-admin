
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TrendPoint } from "../../Types/dashboard.types";

type Props = {
  data: TrendPoint[];
};

const EngagementLineChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />

          <Line type="monotone" dataKey="activeUsers" name="Active users" stroke="#13334c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="watchMinutes" name="Watch minutes" stroke="#13334c" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagementLineChart;
