import React from "react";
import type { UserDetails } from "../../Types/users.types";
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "../../../../app/shared";

const EnrollmentsCard: React.FC<{ user: UserDetails }> = ({ user }) => {
  const enrollments = user.enrollments ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollments</CardTitle>
      </CardHeader>
      <CardContent>
        {!enrollments.length ? (
          <EmptyState title="No enrollments" description="Student enrollments will appear here." />
        ) : (
          <div className="space-y-2">
            {enrollments.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="break-words font-medium text-slate-900">{e.courseTitle}</p>
                <p className="text-sm text-slate-500">Completion: {e.completionRate}%</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentsCard;
