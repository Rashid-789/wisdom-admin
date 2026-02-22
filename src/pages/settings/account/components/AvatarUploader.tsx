/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import toast from "react-hot-toast";
import { Button } from "../../../../app/shared";
import { deleteAvatar, uploadAvatar } from "../../Api/settings.api";
import RemoveAvatarModal from "./RemoveAvatarModal";
import { useAdminAuth } from "../../../../auth/useAdminAuth";

const MAX_SIZE_MB = 3;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function getInitial(displayName?: string) {
  const c = (displayName ?? "").trim()[0] ?? "A";
  return c.toUpperCase();
}

export default function AvatarUploader({
  avatarUrl,
  displayName,
  onUpdated,
}: {
  avatarUrl: string | null;
  displayName?: string;
  onUpdated: () => void;
}) {
  const { refresh } = useAdminAuth();

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const onPick = async (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Please upload PNG, JPG, or WEBP");
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      toast.error(`Max file size is ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated");
      await refresh();
      await onUpdated();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-700">
              {getInitial(displayName)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            className="hidden"
            disabled={uploading || removing}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPick(f);
            }}
          />

          <Button
            variant="outline"
            isLoading={uploading}
            disabled={removing}
            onClick={() => inputRef.current?.click()}
          >
            Upload Avatar
          </Button>

          <Button
            variant="outline"
            disabled={!avatarUrl || uploading}
            isLoading={removing}
            onClick={() => setRemoveOpen(true)}
          >
            Remove
          </Button>
        </div>

        <p className="text-xs text-slate-500">PNG/JPG/WEBP up to {MAX_SIZE_MB}MB</p>
      </div>

      <RemoveAvatarModal
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        isLoading={removing}
        onConfirm={async () => {
          setRemoving(true);
          try {
            await deleteAvatar();
            toast.success("Avatar removed");
            await refresh();
            await onUpdated();
            setRemoveOpen(false);
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to remove avatar");
          } finally {
            setRemoving(false);
          }
        }}
      />
    </>
  );
}