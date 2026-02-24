import React from "react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../app/shared";

const MAX_SIZE_MB = 3;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

type AvatarFieldProps = {
  value: string | null;
  onChange: (nextUrl: string | null, meta?: { avatarPath?: string | null; file?: File | null }) => void;
  displayName?: string;
  email?: string;
  disabled?: boolean;
};

function getInitial(displayName?: string, email?: string) {
  const base = (displayName ?? "").trim() || (email ?? "").trim() || "A";
  return base[0]?.toUpperCase() ?? "A";
}

const AvatarField: React.FC<AvatarFieldProps> = ({
  value,
  onChange,
  displayName,
  email,
  disabled,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState(value ?? "");

  React.useEffect(() => {
    if (!localPreview) {
      setUrlInput(value ?? "");
    }
  }, [value, localPreview]);

  React.useEffect(() => {
    if (localPreview && value && value !== localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [localPreview, value]);

  React.useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const pickFile = (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Please upload PNG, JPG, or WEBP");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      toast.error(`Max file size is ${MAX_SIZE_MB}MB`);
      return;
    }

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUrlInput("");
    onChange(previewUrl, { avatarPath: null, file });
  };

  const clear = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    setUrlInput("");
    onChange(null, { avatarPath: null, file: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewUrl = localPreview ?? value ?? null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-700">
              {getInitial(displayName, email)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />

          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Upload from device
          </Button>

          <Button variant="outline" disabled={disabled || !previewUrl} onClick={clear}>
            Remove
          </Button>
        </div>

        <p className="text-xs text-slate-500">PNG/JPG/WEBP up to {MAX_SIZE_MB}MB</p>
      </div>

      <Input
        label="Avatar URL (optional)"
        value={urlInput}
        onChange={(e) => {
          const next = e.target.value;
          setUrlInput(next);
          if (localPreview) {
            URL.revokeObjectURL(localPreview);
            setLocalPreview(null);
          }
          onChange(next.trim() ? next.trim() : null, { avatarPath: null, file: null });
        }}
        placeholder="https://..."
        disabled={disabled}
      />
    </div>
  );
};

export default AvatarField;
