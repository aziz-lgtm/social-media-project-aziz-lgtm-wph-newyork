"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Trash2, Upload, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar, UserMenu } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { createPost } from "@/lib/api/posts";
import { getApiErrorMessage } from "@/lib/api/axios";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

/** Mobile header matches the pattern from the public profile page: back arrow + title + own avatar. */
function MobileHeader() {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <span className="text-lg font-bold">Add Post</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

function AddPostContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createPost(file!, caption.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      // Measured from design/pop-up-tos-later-dekstop.svg: solid #079455
      // green, rx-8, white text — overridden here since it's the only
      // toast with a measured design; other toast calls keep the default
      // richColors palette.
      toast.success("Success Post", {
        style: {
          background: "var(--color-accent-green)",
          color: "var(--color-white)",
          border: "none",
          borderRadius: "8px",
        },
      });
      router.push("/feed");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const applyFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setImageError("Only PNG or JPG files are allowed.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setImageError("File must be 5mb or smaller.");
      return;
    }
    setImageError(null);
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = () => {
    if (!file) {
      setImageError("Please select a photo to upload.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden items-center gap-3 lg:flex">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <h1 className="text-display-xs font-bold">Add Post</h1>
      </div>

      <div>
        <label className="text-sm font-bold">Photo</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => applyFile(e.target.files?.[0])}
        />

        {previewUrl ? (
          <div className="mt-1.5 flex flex-col rounded-xl border border-border bg-neutral-950 px-7 pt-4 pb-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, next/image's optimizer can't fetch it */}
              <img
                src={previewUrl}
                alt="Selected photo"
                className="size-full object-cover"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9.75 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-border px-2.5 text-sm font-semibold text-foreground"
              >
                <Upload className="size-4" />
                Change Image
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="flex h-9.75 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-border px-2.5 text-sm font-semibold text-destructive"
              >
                <Trash2 className="size-4" />
                Delete Image
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              applyFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "mt-1.5 flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed bg-neutral-950 px-4",
              imageError
                ? "border-destructive"
                : dragActive
                  ? "border-primary-200"
                  : "border-border"
            )}
          >
            <span className="flex size-9.75 items-center justify-center rounded-xl border border-border">
              <UploadCloud className="size-4 text-foreground" />
            </span>
            <p className="text-sm">
              <span className="font-semibold text-primary-200">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </p>
            <p className="text-sm text-muted-foreground">PNG or JPG (max. 5mb)</p>
          </button>
        )}

        {imageError && <p className="mt-2 text-sm text-destructive">{imageError}</p>}
      </div>

      <div>
        <label htmlFor="caption" className="text-sm font-bold">
          Caption
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Create your caption"
          className="mt-1.5 h-25 w-full resize-none rounded-xl border border-border bg-neutral-950 p-4 text-sm text-foreground outline-none placeholder:text-neutral-600"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={mutation.isPending}
        className="flex h-10 items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white hover:bg-primary-200 disabled:opacity-60 lg:h-12"
      >
        {mutation.isPending ? "Sharing…" : "Share"}
      </button>
    </div>
  );
}

export default function AddPostPage() {
  return (
    <AuthGuard>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileHeader />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-113 lg:px-0 lg:pt-10">
        <AddPostContent />
      </main>
    </AuthGuard>
  );
}
