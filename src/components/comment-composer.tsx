"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import { EmojiPicker } from "@/components/emoji-picker";
import { cn } from "@/lib/utils";

/**
 * Re-measured via getBBox() from design/comment-dekstop.svg and
 * design/comment-mobile.svg (identical on both breakpoints): emoji button
 * and input are both 47px tall (rx 11.5), separated by a 9px gap — not the
 * 36px/20px originally guessed here.
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
    <div className="flex items-center gap-2.25">
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Choose emoji"
          onClick={() => setPickerOpen((v) => !v)}
          className="flex size-11.75 items-center justify-center rounded-[11.5px] border border-border text-foreground"
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

      <div className="flex h-11.75 flex-1 items-center rounded-[11.5px] border border-border bg-neutral-950 pl-4 pr-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add Comment"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || isPending}
          className={cn(
            "shrink-0 text-sm font-semibold",
            text.trim() ? "text-primary-200" : "text-neutral-600"
          )}
        >
          Post
        </button>
      </div>
    </div>
  );
}
