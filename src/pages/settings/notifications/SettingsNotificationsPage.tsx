import React from "react";
import { Card, CardContent } from "../../../app/shared";
import type { NotificationPrefs } from "../Types/settings.types";
import { getSettingsSnapshot } from "../Api/settings.api";
import NotificationPrefsCard from "./components/NotificationPrefsCard";

export default function SettingsNotificationsPage() {
  const [prefs, setPrefs] = React.useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getSettingsSnapshot();
      setPrefs(snap.notifications);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && !prefs) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </CardContent>
      </Card>
    );
  }

  if (!prefs) return null;

  return <NotificationPrefsCard prefs={prefs} onUpdated={load} />;
}

