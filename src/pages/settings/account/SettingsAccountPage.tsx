import React from "react";
import { Card, CardContent } from "../../../app/shared";
import type { AdminAccount } from "../Types/settings.types";
import { getSettingsSnapshot } from "../Api/settings.api";
import ProfileCard from "./components/ProfileCard";
import PasswordCard from "./components/PasswordCard";

export default function SettingsAccountPage() {
  const [account, setAccount] = React.useState<AdminAccount | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getSettingsSnapshot();
      setAccount(snap.account);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && !account) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </CardContent>
      </Card>
    );
  }

  if (!account) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ProfileCard account={account} onUpdated={load} />
      <PasswordCard email={account.email} />
    </div>
  );
}