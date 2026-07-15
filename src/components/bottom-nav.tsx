"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Home icon's Home/Explore switcher is self-designed (no Figma reference):
 * hover-opens on desktop, tap-opens via the caret on mobile since touch has
 * no hover. Tapping "Home" itself still navigates directly.
 */
export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/feed" || pathname === "/explore";
  const isProfile = pathname === "/me";
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset during render, not in a useEffect (react-hooks/set-state-in-effect).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex h-16 w-86.25 -translate-x-1/2 items-center justify-center gap-11.25 rounded-full border border-border bg-neutral-950 backdrop-blur-[50px] lg:h-20 lg:w-90 lg:backdrop-blur-none">
      <div
        ref={containerRef}
        className="relative flex flex-col items-center"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {menuOpen && (
          // pb-3 (not mb-3) keeps the gap inside the hoverable box, so the
          // cursor never crosses dead space and loses hover mid-transit.
          <div className="absolute bottom-full pb-3">
            <div className="flex w-32 flex-col overflow-hidden rounded-xl border border-border bg-neutral-950 py-1 shadow-lg">
              <Link
                href="/feed"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-4 py-2 text-left text-sm font-semibold",
                  pathname === "/feed" ? "text-primary-200" : "text-foreground"
                )}
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-4 py-2 text-left text-sm font-semibold",
                  pathname === "/explore" ? "text-primary-200" : "text-foreground"
                )}
              >
                Explore
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/feed"
            className={cn(
              "flex flex-col items-center gap-1 text-sm font-semibold",
              isHome ? "text-primary-200" : "text-foreground"
            )}
          >
            <Home className="size-5" />
            Home
          </Link>
          <button
            type="button"
            aria-label="Switch between Home and Explore"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(isHome ? "text-primary-200" : "text-muted-foreground")}
          >
            <ChevronUp className={cn("size-3 transition-transform", menuOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      <Link
        href="/feed/new"
        aria-label="Create post"
        className="flex size-11 items-center justify-center rounded-full bg-primary-300 text-white hover:bg-primary-200 lg:size-12"
      >
        <Plus className="size-5" strokeWidth={2} />
      </Link>

      <Link
        href="/me"
        className={cn(
          "flex flex-col items-center gap-1 text-sm font-semibold",
          isProfile ? "text-primary-200" : "text-foreground"
        )}
      >
        <User className="size-5" />
        Profile
      </Link>
    </nav>
  );
}
