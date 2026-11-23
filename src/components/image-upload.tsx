"use client";

import { upload } from "@vercel/blob/client";
import { ImageIcon, RotateCcwIcon, UploadIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { trustConfig } from "@/config/trust";

type State = "idle" | "uploading" | "processing" | "error" | "done";

/**
 * Sends one image straight to private storage (`/api/files` checks the path), shows the format,
 * the size limit and the progress, and lets the user retry. `onUploaded` saves the result.
 */
export function ImageUpload({
  folder,
  onUploaded,
}: {
  /** `<kind>/<ownerId>`, e.g. `proof/<disputeId>`. */
  folder: string;
  onUploaded: (path: string) => Promise<unknown>;
}) {
  const t = useTranslations("upload");
  const format = useFormatter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxSize = format.number(trustConfig.imageMaxBytes / 1024 / 1024, {
    style: "unit",
    unit: "megabyte",
  });

  const send = async (picked: File) => {
    setFile(picked);
    setError(null);
    if (!(trustConfig.imageTypes as readonly string[]).includes(picked.type))
      return fail(t("errors.type"));
    if (picked.size > trustConfig.imageMaxBytes)
      return fail(t("errors.size", { max: maxSize }));
    try {
      setState("uploading");
      setProgress(0);
      const blob = await upload(`${folder}/${picked.name}`, picked, {
        access: "private",
        handleUploadUrl: "/api/files",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      setState("processing");
      await onUploaded(blob.pathname);
      setState("done");
    } catch {
      fail(t("errors.failed"));
    }
  };
  const fail = (message: string) => {
    setError(message);
    setState("error");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={trustConfig.imageTypes.join(",")}
        className="sr-only"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (picked) send(picked);
        }}
      />
      <Attachment state={state} className="w-full">
        <AttachmentMedia>
          {state === "uploading" || state === "processing" ? (
            <Spinner />
          ) : state === "idle" ? (
            <UploadIcon />
          ) : (
            <ImageIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{file?.name ?? t("choose")}</AttachmentTitle>
          <AttachmentDescription>
            {error ??
              (state === "uploading"
                ? t("progress", { percent: Math.round(progress) })
                : state === "done"
                  ? t("done")
                  : t("hint", { max: maxSize }))}
          </AttachmentDescription>
        </AttachmentContent>
        {state === "error" && file && (
          <AttachmentActions>
            <AttachmentAction
              aria-label={t("retry")}
              onClick={() => send(file)}
            >
              <RotateCcwIcon />
            </AttachmentAction>
          </AttachmentActions>
        )}
        {(state === "idle" || state === "error") && (
          <AttachmentTrigger
            aria-label={t("choose")}
            onClick={() => input.current?.click()}
          />
        )}
      </Attachment>
      {state === "uploading" && (
        <Progress value={progress} aria-label={t("choose")} />
      )}
    </div>
  );
}
