"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  invalid?: boolean;
};

export function PasswordInput({
  className,
  invalid,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn(
        "flex h-12 items-center rounded-xl border bg-[#0A0D12] px-4 focus-within:ring-1",
        invalid
          ? "border-[#B41759] focus-within:ring-[#B41759]"
          : "border-border focus-within:ring-ring",
        className
      )}
    >
      <input
        type={visible ? "text" : "password"}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-[#535862]"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="ml-2 shrink-0 text-[#717680] hover:text-foreground"
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
