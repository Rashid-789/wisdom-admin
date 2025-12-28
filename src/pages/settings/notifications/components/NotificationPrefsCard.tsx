import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, SwitchRow } from "../../../../app/shared";
import type { NotificationPrefs } from "../../Types/settings.types";
import { updateNotificationPrefs } from "../../Api/settings.api";
import { SectionTabs, settingsTabs } from "../../../../app/shared";


export default function NotificationPrefsCard({
  prefs,
  onUpdated,
}: {
  prefs: NotificationPrefs;
  onUpdated: () => void;
}) {
  const [value, setValue] = React.useState<NotificationPrefs>(prefs);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setValue(prefs), [prefs]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="mb-4 flex items-end justify-end gap-3">
          <SectionTabs tabs={settingsTabs} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Email notifications
          </h2>
          <p className="text-sm text-slate-500">
            Choose what the admin receives by email
          </p>
        </div>

        <div className="space-y-2">
          <SwitchRow
            title="New user signup"
            description="Get notified when a new student/teacher registers"
            checked={value.email.newUserSignup}
            onChange={(checked) =>
              setValue((p) => ({
                ...p,
                email: { ...p.email, newUserSignup: checked },
              }))
            }
          />
          <SwitchRow
            title="New purchase"
            description="Books + subscriptions purchases"
            checked={value.email.newPurchase}
            onChange={(checked) =>
              setValue((p) => ({
                ...p,
                email: { ...p.email, newPurchase: checked },
              }))
            }
          />
          <SwitchRow
            title="Refund requests"
            description="Get notified when a refund is requested"
            checked={value.email.refundRequests}
            onChange={(checked) =>
              setValue((p) => ({
                ...p,
                email: { ...p.email, refundRequests: checked },
              }))
            }
          />
          <SwitchRow
            title="Live class reminders"
            description="Upcoming sessions and attendance reminders"
            checked={value.email.liveClassReminders}
            onChange={(checked) =>
              setValue((p) => ({
                ...p,
                email: { ...p.email, liveClassReminders: checked },
              }))
            }
          />
          <SwitchRow
            title="Weekly summary"
            description="Weekly overview of activity and revenue"
            checked={value.email.weeklySummary}
            onChange={(checked) =>
              setValue((p) => ({
                ...p,
                email: { ...p.email, weeklySummary: checked },
              }))
            }
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateNotificationPrefs(value);
                toast.success("Notification settings saved");
                await onUpdated();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (e: any) {
                toast.error(e?.message ?? "Failed to save settings");
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
