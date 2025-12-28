import React from "react";
import type { UserDetails } from "../Types/users.types";
import { cn } from "../../../app/utils/cn";
import EnrollmentsCard from "./cards/EnrollmentsCard";
import ProgressOverview from "./cards/ProgressOverview";
import TokenLedgerTable from "./tables/TokenLedgerTable";
import PurchasesTable from "./tables/PurchasesTable";
import RoleEditor from "./RoleEditor";

type TabKey = "overview" | "enrollments" | "progress" | "tokens" | "purchases" | "role";

function tabsForUser(u: UserDetails): { key: TabKey; label: string }[] {
  if (u.role === "student")
    return [
      { key: "overview", label: "Overview" },
      { key: "enrollments", label: "Enrollments" },
      { key: "progress", label: "Progress" },
      { key: "tokens", label: "Token Ledger" },
      { key: "purchases", label: "Purchases" },
    ];

  if (u.role === "teacher")
    return [
      { key: "overview", label: "Overview" },
      { key: "progress", label: "Activity" },
    ];

  return [
    { key: "overview", label: "Overview" },
    { key: "role", label: "Role" },
  ];
}

const UserDetailsTabs: React.FC<{ user: UserDetails }> = ({ user }) => {
  const tabs = tabsForUser(user);
  const [active, setActive] = React.useState<TabKey>(tabs[0].key);

  React.useEffect(() => {
    setActive(tabs[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  return (
    <div className="space-y-3">
      {/* Tabs: scroll on very small screens to prevent wrapping/overflow */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-medium transition",
              active === t.key
                ? "border-slate-900 bg-[#13334c] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "overview" ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Profile summary and quick actions will live here.
        </div>
      ) : null}

      {active === "enrollments" ? <EnrollmentsCard user={user} /> : null}
      {active === "progress" ? <ProgressOverview user={user} /> : null}
      {active === "tokens" ? <TokenLedgerTable user={user} /> : null}
      {active === "purchases" ? <PurchasesTable user={user} /> : null}
      {active === "role" ? <RoleEditor user={user} /> : null}
    </div>
  );
};

export default UserDetailsTabs;
