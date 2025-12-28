
import React from "react";
import { Card, CardContent, Input, Button } from "../../../../app/shared";
import type { LiveSession } from "../../Types/liveClasses.types";
import { updateLiveSession } from "../../Api/liveClasses.api";

export default function RecordingLinkCard({
  session,
  onChanged,
}: {
  session: LiveSession;
  onChanged: () => void;
}) {
  const [recordingUrl, setRecordingUrl] = React.useState(session.recordingUrl ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setRecordingUrl(session.recordingUrl ?? "");
  }, [session.recordingUrl]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full">
          <Input
            label="Recording link (optional)"
            placeholder="https://..."
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">Store the recording URL after the session ends.</p>
        </div>

        <Button
          isLoading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateLiveSession(session.id, { recordingUrl: recordingUrl.trim() || "" });
              onChanged();
            } finally {
              setSaving(false);
            }
          }}
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
