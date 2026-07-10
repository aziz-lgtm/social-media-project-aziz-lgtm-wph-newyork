"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating pill nav, measured from design/Before-Login.svg:
 * 360x80, rx 1000 (full pill), bg #0A0D12, border #181D27, gap 45,
 * Home icon+label purple (#7F51F9) when active, Plus button 48px
 * circle bg #6936F2, Profile icon+label white (#FDFDFD) when inactive.
 */
export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/feed";
  const isProfile = pathname === "/me";

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex h-20 w-90 -translate-x-1/2 items-center justify-center gap-11.25 rounded-full border border-border bg-[#0A0D12]">
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
        className="flex size-12 items-center justify-center rounded-full bg-[#6936F2] text-white hover:bg-[#7F51F9]"
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
