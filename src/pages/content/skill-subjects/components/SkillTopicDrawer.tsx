import React from "react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../app/shared";
import {
  createSkillTopic,
  updateSkillTopic,
} from "../../Api/content.api";
import type { SkillTopic, SpeedPoint, TopicVideo } from "../../Types/content.types";
import VideoSourcePicker from "../../components/video/VideoSourcePicker";
import { useFirebaseResumableUpload } from "../../hooks/useFirebaseResumableUpload";
import { getVideoDurationSec, isValidHttpUrl, safeFileName } from "../../utils/video.utils";
import TranscriptEditor from "../../courses/components/lectures/TranscriptEditor";
import SpeedPointsEditor from "../../courses/components/lectures/SpeedPointsEditor";

type Props = {
  open: boolean;
  subjectId: string;
  topic: SkillTopic | null;
  onClose: () => void;
  onSaved: (saved: SkillTopic) => void;
};

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `topic_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function SkillTopicDrawer({ open, subjectId, topic, onClose, onSaved }: Props) {
  const isEdit = Boolean(topic);
  const [draftTopicId, setDraftTopicId] = React.useState<string>(topic?.id ?? createClientId());

  const [title, setTitle] = React.useState(topic?.title ?? "");
  const [rewardTokens, setRewardTokens] = React.useState<number>(topic?.rewardTokens ?? 0);
  const [video, setVideo] = React.useState<TopicVideo | null>(topic?.video ?? null);
  const [transcript, setTranscript] = React.useState(topic?.transcript ?? "");
  const [speedPoints, setSpeedPoints] = React.useState<SpeedPoint[]>(topic?.speedPoints ?? []);

  const [mode, setMode] = React.useState<"upload" | "link">(topic?.video?.source ?? "upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState(topic?.video?.source === "link" ? topic.video.url : "");
  const [saving, setSaving] = React.useState(false);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    if (!open) return;
    const nextId = topic?.id ?? createClientId();
    setDraftTopicId(nextId);
    setTitle(topic?.title ?? "");
    setRewardTokens(topic?.rewardTokens ?? 0);
    setVideo(topic?.video ?? null);
    setTranscript(topic?.transcript ?? "");
    setSpeedPoints(topic?.speedPoints ?? []);
    setMode(topic?.video?.source ?? "upload");
    setFile(null);
    setLink(topic?.video?.source === "link" ? topic.video.url : "");
  }, [open, topic]);

  const canAttach =
    mode === "upload" ? Boolean(file) : isValidHttpUrl(link.trim());
  const canSave = title.trim().length > 2 && Boolean(video?.url) && !isUploading;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Topic" : "Add Topic"}
      description="Skill topics are direct video lessons with tokens, transcript, and speed points."
    >
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            label="Topic Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Breathing Techniques"
            disabled={saving || isUploading}
          />

          <Input
            label="Reward Tokens"
            value={String(rewardTokens)}
            onChange={(event) => {
              const numeric = Number(event.target.value);
              setRewardTokens(Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0);
            }}
            disabled={saving || isUploading}
          />

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Video</p>

            <VideoSourcePicker
              mode={mode}
              onModeChange={setMode}
              file={file}
              onFileChange={setFile}
              link={link}
              onLinkChange={setLink}
              disabled={saving || isUploading}
            />

            {video?.url ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <p>
                  Attached: <span className="font-medium">{video.source}</span>
                  {typeof video.durationSec === "number" ? ` - ${video.durationSec}s` : ""}
                </p>
                <a href={video.url} target="_blank" rel="noreferrer" className="mt-1 block truncate underline">
                  {video.url}
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No video attached yet.</p>
            )}

            {isUploading ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancel}>
                    Cancel upload
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={!canAttach || isUploading || saving}
                onClick={async () => {
                  if (mode === "link") {
                    const trimmed = link.trim();
                    if (!isValidHttpUrl(trimmed)) return;
                    setVideo({ source: "link", url: trimmed });
                    return;
                  }

                  if (!file) return;
                  try {
                    const durationSec = await getVideoDurationSec(file);
                    const safeName = safeFileName(file.name);
                    const storagePath = `content/skill/${subjectId}/${draftTopicId}/${Date.now()}_${safeName}`;
                    const uploaded = await upload(storagePath, file);
                    setVideo({
                      source: "upload",
                      url: uploaded.downloadUrl,
                      durationSec,
                      storagePath: uploaded.storagePath,
                    });
                    setFile(null);
                  } catch (uploadError) {
                    if ((uploadError as { code?: string })?.code !== "storage/canceled") {
                      throw uploadError;
                    }
                  }
                }}
              >
                Attach Video
              </Button>
            </div>
          </div>

          <TranscriptEditor value={transcript} onChange={setTranscript} />
          <SpeedPointsEditor value={speedPoints} onChange={setSpeedPoints} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving || isUploading}>
              Cancel
            </Button>
            <Button
              isLoading={saving}
              disabled={!canSave || saving || isUploading}
              onClick={async () => {
                if (!video) return;
                setSaving(true);
                try {
                  const payload = {
                    title: title.trim(),
                    rewardTokens,
                    video,
                    transcript: transcript.trim() || undefined,
                    speedPoints,
                  };

                  const saved = topic
                    ? await updateSkillTopic(subjectId, topic.id, payload)
                    : await createSkillTopic(subjectId, payload, { topicId: draftTopicId });

                  onSaved(saved);
                  onClose();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save Topic
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
