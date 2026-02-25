import React from "react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../../../app/shared";
import type { SpeedPoint, Topic, TopicVideo } from "../../../../Types/content.types";
import VideoSourcePicker from "../../../../components/video/VideoSourcePicker";
import { useFirebaseResumableUpload } from "../../../../hooks/useFirebaseResumableUpload";
import { getVideoDurationSec, isValidHttpUrl, safeFileName } from "../../../../utils/video.utils";
import TranscriptEditor from "../../lectures/TranscriptEditor";
import SpeedPointsEditor from "../../lectures/SpeedPointsEditor";

type Props = {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  chapterId: string;
  topic: Topic | null;
  onChangeTopic: (next: Topic) => void;
};

export default function TopicDrawer({
  open,
  onClose,
  subjectId,
  chapterId,
  topic,
  onChangeTopic,
}: Props) {
  const [local, setLocal] = React.useState<Topic | null>(topic);
  const [mode, setMode] = React.useState<"upload" | "link">(topic?.video?.source ?? "upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState(topic?.video?.source === "link" ? topic.video.url : "");
  const [video, setVideo] = React.useState<TopicVideo | undefined>(topic?.video);
  const [speedPoints, setSpeedPoints] = React.useState<SpeedPoint[]>(topic?.speedPoints ?? []);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    setLocal(topic);
    setMode(topic?.video?.source ?? "upload");
    setFile(null);
    setLink(topic?.video?.source === "link" ? topic.video.url : "");
    setVideo(topic?.video);
    setSpeedPoints(topic?.speedPoints ?? []);
  }, [topic, open]);

  const emitTopicChange = React.useCallback(
    (nextTopic: Topic) => {
      setLocal(nextTopic);
      if (nextTopic.video) {
        setVideo(nextTopic.video);
      }
      onChangeTopic(nextTopic);
      return nextTopic;
    },
    [onChangeTopic]
  );

  if (!open || !local) return null;

  const canAttachVideo = mode === "upload" ? Boolean(file) : isValidHttpUrl(link.trim());

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Topic Content"
      description="Set title, reward tokens, topic video, transcript, and speed points."
    >
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            label="Topic Title"
            value={local.title}
            onChange={(event) => setLocal({ ...local, title: event.target.value })}
          />

          <Input
            label="Reward Tokens"
            value={String(local.rewardTokens ?? 0)}
            onChange={(event) => {
              const numeric = Number(event.target.value);
              setLocal({
                ...local,
                rewardTokens: Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0,
              });
            }}
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
              disabled={isUploading}
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
                disabled={isUploading || !canAttachVideo}
                onClick={async () => {
                  if (mode === "link") {
                    const trimmed = link.trim();
                    if (!isValidHttpUrl(trimmed)) return;
                    const updatedTopic: Topic = {
                      ...local,
                      speedPoints,
                      video: { source: "link", url: trimmed },
                    };
                    emitTopicChange(updatedTopic);
                    return;
                  }

                  if (!file) return;
                  try {
                    const durationSec = await getVideoDurationSec(file);
                    const safeName = safeFileName(file.name);
                    const storagePath = `content/basic/${subjectId}/${chapterId}/${local.id}/${Date.now()}_${safeName}`;
                    const uploaded = await upload(storagePath, file);
                    const updatedTopic: Topic = {
                      ...local,
                      speedPoints,
                      video: {
                        source: "upload",
                        url: uploaded.downloadUrl,
                        durationSec,
                        storagePath: uploaded.storagePath,
                      },
                    };
                    emitTopicChange(updatedTopic);
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

          <TranscriptEditor
            value={local.transcript ?? ""}
            onChange={(value) => setLocal({ ...local, transcript: value })}
          />

          <SpeedPointsEditor value={speedPoints} onChange={setSpeedPoints} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Close
            </Button>
            <Button
              disabled={!local.title.trim() || isUploading}
              onClick={() => {
                emitTopicChange({
                  ...local,
                  title: local.title.trim(),
                  rewardTokens: Number(local.rewardTokens ?? 0),
                  video,
                  transcript: local.transcript?.trim() ? local.transcript.trim() : undefined,
                  speedPoints,
                });
                onClose();
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
