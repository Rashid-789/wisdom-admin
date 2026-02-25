import React from "react";
import type { UserDetails } from "../../Types/users.types";
import { Badge, Card, CardContent } from "../../../../app/shared";

function initials(name: string) {
  const p = name.trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[1]?.[0] ?? "")).toUpperCase();
}

const ProfileCard: React.FC<{ user: UserDetails }> = ({ user }) => {
  const displayName = user.name ?? "Unknown User";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initials(displayName)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{user.role}</Badge>
            <Badge tone={user.status === "active" ? "success" : user.status === "disabled" ? "warning" : "danger"}>
              {user.status}
            </Badge>
            {user.role === "teacher" ? (
              <Badge tone={user.verified ? "success" : "warning"}>{user.verified ? "verified" : "unverified"}</Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
