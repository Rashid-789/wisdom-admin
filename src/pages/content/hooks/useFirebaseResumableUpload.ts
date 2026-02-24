import * as React from "react";
import { getDownloadURL, ref, uploadBytesResumable, type UploadTask } from "firebase/storage";
import { storage } from "../../../app/utils/firebase";

type UploadState = "idle" | "uploading" | "success" | "error" | "canceled";

export function useFirebaseResumableUpload() {
  const taskRef = React.useRef<UploadTask | null>(null);

  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string>("");

  const cancel = React.useCallback(() => {
    if (taskRef.current) {
      taskRef.current.cancel();
      setState("canceled");
    }
  }, []);

  const upload = React.useCallback(
    async (args: { storagePath: string; file: File }) => {
      setError("");
      setProgress(0);
      setState("uploading");

      const storageRef = ref(storage, args.storagePath);
      const task = uploadBytesResumable(storageRef, args.file, {
        contentType: args.file.type || "video/mp4",
      });

      taskRef.current = task;

      return new Promise<{ downloadUrl: string; storagePath: string; sizeBytes: number }>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const p = snap.totalBytes > 0 ? (snap.bytesTransferred / snap.totalBytes) * 100 : 0;
            setProgress(Math.max(0, Math.min(100, Math.round(p))));
          },
          (err) => {
            if (err?.code === "storage/canceled") {
              setState("canceled");
              reject(err);
              return;
            }
            setState("error");
            setError(err?.message ?? "Upload failed");
            reject(err);
          },
          async () => {
            const downloadUrl = await getDownloadURL(task.snapshot.ref);
            setState("success");
            resolve({
              downloadUrl,
              storagePath: task.snapshot.ref.fullPath,
              sizeBytes: task.snapshot.totalBytes,
            });
          }
        );
      });
    },
    []
  );

  return { upload, cancel, state, progress, error };
}