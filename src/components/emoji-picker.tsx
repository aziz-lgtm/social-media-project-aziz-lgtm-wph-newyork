"use client";

const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😎", "🤩",
  "👍", "👏", "🙌", "🔥", "💯", "🎉",
  "❤️", "😢", "😮", "🙏", "✨", "😅",
];

/**
 * Measured from design/select-emoji-mobile.svg and
 * design/selecting-emoji-dekstop.svg: same 209x151 popover (rx 11.5,
 * bg #0A0D12, border #181D27) on both breakpoints, anchored above the
 * comment composer.
 */
export function EmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <div className="absolute bottom-full left-0 mb-2 grid w-52.25 grid-cols-6 gap-1 rounded-[11.5px] border border-border bg-neutral-950 p-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex aspect-square items-center justify-center rounded-md text-lg hover:bg-white/10"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
