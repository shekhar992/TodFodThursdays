import { useState, useRef, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Upload, X, Image, Video, Loader2, AlertCircle } from "lucide-react";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|avi|m4v)(\?|$)/i.test(url);
}

export function MediaUploader({ value, onChange, folder = "tft2-events" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const result = await uploadToCloudinary(file, folder);
        onChange(result.secure_url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed — check Cloudinary config.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Preview state ──
  if (value) {
    const isVid = isVideoUrl(value);
    return (
      <div className="relative mt-1 overflow-hidden rounded-xl border border-border/70 bg-card/30 group">
        {isVid ? (
          <video src={value} controls className="w-full max-h-48 object-cover" />
        ) : (
          <img src={value} alt="Event media" className="w-full max-h-48 object-cover" />
        )}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground hover:text-destructive transition-colors shadow-sm"
          title="Remove media"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-2 left-2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">
          {isVid ? "Video" : "Image"} · click ✕ to replace
        </div>
      </div>
    );
  }

  // ── Upload zone ──
  return (
    <div
      className={`mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 transition-colors cursor-pointer ${
        isDragging
          ? "border-gold/60 bg-gold/5"
          : "border-border/60 hover:border-gold/40 hover:bg-card/30"
      }`}
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {uploading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
          <p className="text-xs text-muted-foreground">Uploading to Cloudinary…</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image className="h-5 w-5" />
            <Upload className="h-4 w-4" />
            <Video className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Drop an image or video here, or{" "}
            <span className="text-gold underline cursor-pointer">browse</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60">JPG, PNG, GIF, MP4, MOV supported</p>
          {error && (
            <div className="flex items-center gap-1.5 text-[10px] text-destructive mt-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
