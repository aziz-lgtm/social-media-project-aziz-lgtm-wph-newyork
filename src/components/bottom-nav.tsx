"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating pill nav. Measured from design/Before-Login.svg (desktop) and
 * design/Before-Login-mobile.svg (mobile):
 * desktop 360x80, mobile 345x64 with backdrop-blur(50px) — both rx 1000
 * (full pill), bg #0A0D12, border #181D27, gap 45 (same both).
 * Plus button: 48px circle desktop, 44px circle mobile (measured radius 22).
 * Home icon+label purple (#7F51F9) when active, Profile white (#FDFDFD).
 */
export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/feed";
  const isProfile = pathname === "/me";

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex h-16 w-86.25 -translate-x-1/2 items-center justify-center gap-11.25 rounded-full border border-border bg-[#0A0D12] backdrop-blur-[50px] md:h-20 md:w-90 md:backdrop-blur-none">
      <Link
        href="/feed"
        className={cn(
          "flex flex-col items-center gap-1 text-sm font-semibold",
          isHome ? "text-[#7F51F9]" : "text-foreground"
        )}
      >
        <Home className="size-5" />
        Home
      </Link>

      <Link
        href="/feed/new"
        aria-label="Create post"
        className="flex size-11 items-center justify-center rounded-full bg-[#6936F2] text-white hover:bg-[#7F51F9] md:size-12"
      >
        <Plus className="size-5" strokeWidth={2} />
      </Link>

      <Link
        href="/me"
        className={cn(
          "flex flex-col items-center gap-1 text-sm font-semibold",
          isProfile ? "text-[#7F51F9]" : "text-foreground"
        )}
      >
        <User className="size-5" />
        Profile
      </Link>
    </nav>
  );
}
