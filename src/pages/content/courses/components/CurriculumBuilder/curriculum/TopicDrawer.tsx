import React from "react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../../../app/shared";
import type { CourseCategory, ImageAsset, SpeedPoint, Topic, TopicVideo } from "../../../../Types/content.types";
import ImageSourcePicker from "../../../../components/media/ImageSourcePicker";
import VideoSourcePicker from "../../../../components/video/VideoSourcePicker";
import { useFirebaseResumableUpload } from "../../../../hooks/useFirebaseResumableUpload";
import { getVideoDurationSec, isValidHttpUrl, safeFileName } from "../../../../utils/video.utils";
import TranscriptEditor from "../../lectures/TranscriptEditor";
import SpeedPointsEditor from "../../lectures/SpeedPointsEditor";

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseCategory: CourseCategory;
  chapterId: string;
  topic: Topic | null;
  onChangeTopic: (next: Topic) => void;
  onSaveTopic?: (next: Topic) => void | Promise<void>;
};

export default function TopicDrawer({
  open,
  onClose,
  courseId,
  courseCategory,
  chapterId,
  topic,
  onChangeTopic,
  onSaveTopic,
}: Props) {
  const [local, setLocal] = React.useState<Topic | null>(topic);

  const [videoMode, setVideoMode] = React.useState<"upload" | "link">(topic?.video?.source ?? "upload");
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoLink, setVideoLink] = React.useState(topic?.video?.source === "link" ? topic.video.url : "");
  const [video, setVideo] = React.useState<TopicVideo | undefined>(topic?.video);

  const [thumbMode, setThumbMode] = React.useState<"upload" | "link">(topic?.thumbnail?.source ?? "upload");
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const [thumbLink, setThumbLink] = React.useState(topic?.thumbnail?.source === "link" ? topic.thumbnail.url : "");
  const [thumbnail, setThumbnail] = React.useState<ImageAsset | undefined>(topic?.thumbnail);

  const [speedPoints, setSpeedPoints] = React.useState<SpeedPoint[]>(topic?.speedPoints ?? []);

  const {
    upload: uploadVideo,
    cancel: cancelVideoUpload,
    state: videoUploadState,
    progress: videoProgress,
    error: videoError,
  } = useFirebaseResumableUpload();

  const {
    upload: uploadThumb,
    cancel: cancelThumbUpload,
    state: thumbUploadState,
    progress: thumbProgress,
    error: thumbError,
  } = useFirebaseResumableUpload();

  const isVideoUploading = videoUploadState === "uploading";
  const isThumbUploading = thumbUploadState === "uploading";
  const isAnyUploading = isVideoUploading || isThumbUploading;
  const [savingTopic, setSavingTopic] = React.useState(false);

  React.useEffect(() => {
    setLocal(topic);
    setVideoMode(topic?.video?.source ?? "upload");
    setVideoFile(null);
    setVideoLink(topic?.video?.source === "link" ? topic.video.url : "");
    setVideo(topic?.video);

    setThumbMode(topic?.thumbnail?.source ?? "upload");
    setThumbFile(null);
    setThumbLink(topic?.thumbnail?.source === "link" ? topic.thumbnail.url : "");
    setThumbnail(topic?.thumbnail);

    setSpeedPoints(topic?.speedPoints ?? []);
  }, [topic, open]);

  const emitTopicChange = React.useCallback(
    (nextTopic: Topic) => {
      setLocal(nextTopic);
      setVideo(nextTopic.video);
      setThumbnail(nextTopic.thumbnail);
      onChangeTopic(nextTopic);
      return nextTopic;
    },
    [onChangeTopic]
  );

  if (!open || !local) return null;

  const canAttachVideo = videoMode === "upload" ? Boolean(videoFile) : isValidHttpUrl(videoLink.trim());
  const canAttachThumbnail = thumbMode === "upload" ? Boolean(thumbFile) : isValidHttpUrl(thumbLink.trim());

  const baseStorage = `content/${courseCategory}/courses/${courseId}/chapters/${chapterId}/topics/${local.id}`;

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
              mode={videoMode}
              onModeChange={setVideoMode}
              file={videoFile}
              onFileChange={setVideoFile}
              link={videoLink}
              onLinkChange={setVideoLink}
              disabled={isAnyUploading}
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

            {isVideoUploading ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading...</span>
                  <span>{videoProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${videoProgress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancelVideoUpload}>
                    Cancel upload
                  </Button>
                </div>
              </div>
            ) : null}

            {videoError ? <p className="text-xs text-red-600">{videoError}</p> : null}

            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={isAnyUploading || !canAttachVideo}
                onClick={async () => {
                  if (videoMode === "link") {
                    const trimmed = videoLink.trim();
                    if (!isValidHttpUrl(trimmed)) return;
                    emitTopicChange({
                      ...local,
                      thumbnail,
                      speedPoints,
                      video: { source: "link", url: trimmed },
                    });
                    return;
                  }

                  if (!videoFile) return;

                  try {
                    const durationSec = await getVideoDurationSec(videoFile);
                    const safeName = safeFileName(videoFile.name);
                    const storagePath = `${baseStorage}/video/${Date.now()}_${safeName}`;

                    const uploaded = await uploadVideo(storagePath, videoFile);

                    emitTopicChange({
                      ...local,
                      thumbnail,
                      speedPoints,
                      video: {
                        source: "upload",
                        url: uploaded.downloadUrl,
                        durationSec,
                        storagePath: uploaded.storagePath,
                      },
                    });

                    setVideoFile(null);
                  } catch (uploadError) {
                    if ((uploadError as { code?: string })?.code !== "storage/canceled") throw uploadError;
                  }
                }}
              >
                Attach Video
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Thumbnail (optional)</p>

            <ImageSourcePicker
              mode={thumbMode}
              onModeChange={setThumbMode}
              file={thumbFile}
              onFileChange={setThumbFile}
              link={thumbLink}
              onLinkChange={setThumbLink}
              disabled={isAnyUploading}
            />

            {thumbnail?.url ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <img src={thumbnail.url} alt="Topic thumbnail" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-600">
                      Source: <span className="font-medium">{thumbnail.source}</span>
                    </p>
                    <a
                      href={thumbnail.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-slate-600 underline"
                    >
                      {thumbnail.url}
                    </a>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      emitTopicChange({
                        ...local,
                        video,
                        speedPoints,
                        thumbnail: undefined,
                      })
                    }
                    disabled={isAnyUploading}
                  >
                    Remove thumbnail
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No thumbnail attached yet.</p>
            )}

            {isThumbUploading ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading thumbnail...</span>
                  <span>{thumbProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${thumbProgress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancelThumbUpload}>
                    Cancel upload
                  </Button>
                </div>
              </div>
            ) : null}

            {thumbError ? <p className="text-xs text-red-600">{thumbError}</p> : null}

            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={isAnyUploading || !canAttachThumbnail}
                onClick={async () => {
                  if (thumbMode === "link") {
                    const trimmed = thumbLink.trim();
                    if (!isValidHttpUrl(trimmed)) return;
                    emitTopicChange({
                      ...local,
                      video,
                      speedPoints,
                      thumbnail: { source: "link", url: trimmed },
                    });
                    return;
                  }

                  if (!thumbFile) return;

                  try {
                    const safeName = safeFileName(thumbFile.name);
                    const storagePath = `${baseStorage}/thumbnail/${Date.now()}_${safeName}`;

                    const uploaded = await uploadThumb(storagePath, thumbFile);

                    emitTopicChange({
                      ...local,
                      video,
                      speedPoints,
                      thumbnail: {
                        source: "upload",
                        url: uploaded.downloadUrl,
                        storagePath: uploaded.storagePath,
                      },
                    });

                    setThumbFile(null);
                  } catch (uploadError) {
                    if ((uploadError as { code?: string })?.code !== "storage/canceled") throw uploadError;
                  }
                }}
              >
                Attach Thumbnail
              </Button>
            </div>
          </div>

          <TranscriptEditor
            value={local.transcript ?? ""}
            onChange={(value) => setLocal({ ...local, transcript: value })}
          />

          <SpeedPointsEditor value={speedPoints} onChange={setSpeedPoints} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isAnyUploading || savingTopic}>
              Close
            </Button>

            <Button
              isLoading={savingTopic}
              disabled={!local.title.trim() || isAnyUploading || savingTopic}
              onClick={async () => {
                if (savingTopic) return;
                const nextTopic = emitTopicChange({
                  ...local,
                  title: local.title.trim(),
                  rewardTokens: Number(local.rewardTokens ?? 0),
                  video,
                  thumbnail,
                  transcript: local.transcript?.trim() ? local.transcript.trim() : undefined,
                  speedPoints,
                });
                setSavingTopic(true);
                try {
                  await onSaveTopic?.(nextTopic);
                  onClose();
                } finally {
                  setSavingTopic(false);
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
