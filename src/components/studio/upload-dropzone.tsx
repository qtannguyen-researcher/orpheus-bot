"use client";

import { useId, useState } from "react";
import { formatBytes, validateUpload } from "@/lib/audio/formats";

type FileState =
  | { kind: "empty" }
  | { kind: "ready"; name: string; size: string }
  | { kind: "error"; message: string };

export function UploadDropzone() {
  const inputId = useId();
  const [state, setState] = useState<FileState>({ kind: "empty" });
  const [over, setOver] = useState(false);

  function inspect(file: File | undefined) {
    if (!file) {
      setState({ kind: "empty" });
      return;
    }

    const result = validateUpload({
      filename: file.name,
      byteSize: file.size,
      mime: file.type,
    });

    if (!result.ok) {
      setState({ kind: "error", message: result.message });
      return;
    }

    setState({ kind: "ready", name: file.name, size: formatBytes(file.size) });
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        inspect(event.dataTransfer.files[0]);
      }}
      className={`rounded-sm border border-dashed px-6 py-10 text-center transition-colors ${
        over ? "border-gold bg-gold/10" : "border-rule bg-white/40"
      }`}
    >
      <label htmlFor={inputId} className="block cursor-pointer">
        <p className="font-serif text-2xl text-ink">Drop a recording</p>
        <p className="mt-2 text-sm text-muted">
          mp3, aac, ogg, flac, alac, wav, aiff · 25 MB · storage and jobs arrive in M1
        </p>
        <input
          id={inputId}
          type="file"
          accept=".mp3,.aac,.acc,.m4a,.ogg,.oga,.flac,.alac,.wav,.aiff,.aif,.caf,audio/*"
          className="sr-only"
          onChange={(event) => inspect(event.target.files?.[0])}
        />
      </label>
      {state.kind === "ready" ? (
        <p className="mt-6 font-mono text-sm text-ink-soft">
          {state.name} · {state.size} · accepted. Upload persists after Capture (M1).
        </p>
      ) : null}
      {state.kind === "error" ? (
        <p className="mt-6 text-sm text-danger">{state.message}</p>
      ) : null}
    </div>
  );
}
