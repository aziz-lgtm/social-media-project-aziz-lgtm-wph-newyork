"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import { EmojiPicker } from "@/components/emoji-picker";
import { cn } from "@/lib/utils";

/**
 * Measured from design/comment-dekstop.svg and design/comment-mobile.svg:
 * emoji button ~36x36 (rx 11.5), input flex-1 h-9 (rx 11.5, bg #0A0D12,
 * border #181D27), gap ~20px, "Post" text right-aligned inside the row.
 */
export function CommentComposer({
  onSubmit,
  isPending,
}: {
  onSubmit: (text: string) => void;
  isPending: boolean;
}) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    onSubmit(trimmed);
    setText("");
    setPickerOpen(false);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Choose emoji"
          onClick={() => setPickerOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-[11.5px] border border-border text-foreground"
        >
          <Smile className="size-5" />
        </button>
        {pickerOpen && (
          <EmojiPicker
            onSelect={(emoji) => {
              setText((t) => t + emoji);
              setPickerOpen(false);
            }}
          />
        )}
      </div>

      <div className="flex h-9 flex-1 items-center rounded-[11.5px] border border-border bg-[#0A0D12] pl-4 pr-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add Comment"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-[#535862]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || isPending}
          className={cn(
            "shrink-0 text-sm font-semibold",
            text.trim() ? "text-[#7F51F9]" : "text-[#535862]"
          )}
        >
          Post
        </button>
      </div>
    </div>
  );
}
