// import React from "react";
import { Button, Input } from "../../../../app/shared";
import { isValidHttpUrl } from "../../utils/video.utils";

type Mode = "upload" | "link";

export default function VideoSourcePicker({
  mode,
  onModeChange,
  file,
  onFileChange,
  link,
  onLinkChange,
  disabled,
}: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
  link: string;
  onLinkChange: (v: string) => void;
  disabled?: boolean;
}) {
  const linkOk = !link.trim() || isValidHttpUrl(link.trim());

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("upload")}
          className={
            mode === "upload"
              ? "rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              : "rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          }
          disabled={disabled}
        >
          Upload from device
        </button>
        <button
          type="button"
          onClick={() => onModeChange("link")}
          className={
            mode === "link"
              ? "rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              : "rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          }
          disabled={disabled}
        >
          Use video link
        </button>
      </div>

      {mode === "upload" ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-900">Video file</span>
            <input
              type="file"
              accept="video/*"
              className="block w-full text-sm"
              disabled={disabled}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onFileChange(f);
              }}
            />
          </label>

          {file ? (
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
              <span className="truncate">{file.name}</span>
              <Button variant="outline" onClick={() => onFileChange(null)} disabled={disabled}>
                Remove
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Best practice: upload video here (resumable). Later you can add HLS processing in Cloud Functions.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
          <Input
            label="Video URL"
            placeholder="https://..."
            value={link}
            onChange={(e) => onLinkChange(e.target.value)}
            disabled={disabled}
          />
          {!linkOk ? <p className="text-xs text-red-600">Please enter a valid http/https URL</p> : null}
          <p className="text-xs text-slate-500">
            Use this for hosted MP4/HLS or unlisted platform URLs. Student app will play this URL.
          </p>
        </div>
      )}
    </div>
  );
}