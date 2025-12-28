import React from "react";
import type { UserDetails } from "../../Types/users.types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../app/shared";

const ProgressOverview: React.FC<{ user: UserDetails }> = ({ user }) => {
  const completion = user.progress?.completionRate ?? 0;
  const minutes = user.progress?.watchMinutes ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-sm text-slate-500">Completion</p>
          <p className="text-lg font-semibold text-slate-900">{completion}%</p>

          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-[#13334c]" style={{ width: `${Math.min(100, completion)}%` }} />
          </div>

          <p className="mt-4 text-sm text-slate-500">Watch Minutes</p>
          <p className="text-lg font-semibold text-slate-900">{minutes}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressOverview;
