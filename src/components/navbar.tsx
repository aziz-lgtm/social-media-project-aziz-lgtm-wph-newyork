"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchResultsList, useUserSearch } from "@/components/user-search";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";
import { useRouter } from "next/navigation";

/** Desktop guest buttons, inline in the header (measured from design/Before-Login.svg). */
function DesktopGuestButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="flex h-10.75 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="flex h-11 items-center rounded-full bg-[#6936F2] px-6 text-sm font-semibold text-white hover:bg-[#7F51F9]"
      >
        Register
      </Link>
    </div>
  );
}

/**
 * Mobile guest buttons, revealed by the hamburger toggle below the header.
 * Measured from design/before-login-open-menu.svg: two ~40px pill buttons
 * flush under the header, gap ~12px, flex-1 to fill the row.
 */
function MobileGuestButtons() {
  return (
    <div className="flex gap-3 px-4 pb-4 md:hidden">
      <Link
        href="/login"
        className="flex h-10 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#6936F2] text-sm font-semibold text-white hover:bg-[#7F51F9]"
      >
        Register
      </Link>
    </div>
  );
}

export function UserMenu({ size }: { size: "desktop" | "mobile" }) {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!user) {
    // Desktop shows Login/Register inline; mobile uses the hamburger toggle instead (see Navbar).
    return size === "desktop" ? <DesktopGuestButtons /> : null;
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className={size === "desktop" ? "size-12" : "size-10"}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {size === "desktop" && (
          <span className="text-base font-semibold text-foreground">
            {user.name}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push("/me")}>
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/messages")}>
          Messages
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            // Clear the session, then do a full navigation (not router.replace)
            // to the guest home. A client-side transition races AuthGuard's own
            // redirect effect on the still-mounted guarded page (e.g. /feed),
            // which wins and sends us to /login?returnTo=... instead.
            dispatch(logout());
            window.location.href = "/";
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [desktopSearchFocused, setDesktopSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchQuery = useUserSearch(query);
  const desktopFormRef = useRef<HTMLDivElement>(null);

  const desktopDropdownOpen = desktopSearchFocused && query.trim().length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black">
      {/* Desktop: 1440×80, px-120 */}
      <div className="mx-auto hidden h-20 w-full max-w-page items-center justify-between gap-6 px-30 md:flex">
        <Link href="/feed" className="flex shrink-0 items-center gap-3">
          <Logo className="text-foreground" />
          <span className="text-2xl font-bold text-foreground">Sociality</span>
        </Link>

        <div ref={desktopFormRef} className="relative w-full max-w-122.75">
          <div className="flex h-12 w-full items-center gap-2 rounded-full border border-border bg-[#0A0D12] px-4">
            <Search className="size-4 shrink-0 text-[#717680]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setDesktopSearchFocused(true)}
              onBlur={(e) => {
                // Keep the dropdown open when focus moves to a result link inside it.
                if (!desktopFormRef.current?.contains(e.relatedTarget as Node)) {
                  setDesktopSearchFocused(false);
                }
              }}
              placeholder="Search"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Measured from design/Found-dekstop.svg and not-found-dekstop.svg: same 490px panel, rx 19.5, bg #0A0D12 border #181D27, positioned flush under the search bar. */}
          {desktopDropdownOpen && (
            <div className="absolute top-full mt-2 w-full rounded-[19.5px] border border-border bg-[#0A0D12] p-3">
              <SearchResultsList
                query={query}
                searchQuery={searchQuery}
                onSelect={() => setDesktopSearchFocused(false)}
              />
            </div>
          )}
        </div>

        <div className="shrink-0">
          <UserMenu size="desktop" />
        </div>
      </div>

      {/* Mobile: 393×64, px-16 */}
      <div className="flex h-16 items-center justify-between px-4 md:hidden">
        <Link href="/feed" className="flex items-center gap-2.5">
          <Logo className="text-foreground" />
          <span className="text-xl font-bold text-foreground">Sociality</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen(true)}
            className="text-foreground"
          >
            <Search className="size-5" />
          </button>
          {user ? (
            <UserMenu size="mobile" />
          ) : (
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="text-foreground"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>

      {!user && menuOpen && <MobileGuestButtons />}

      {/* Mobile full-screen search, measured from design/found-mobile.svg: input+X row replaces the header, results fill the rest of the viewport. */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black md:hidden">
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <div className="flex h-9.75 flex-1 items-center gap-2 rounded-full border border-border bg-[#0A0D12] px-4">
              <Search className="size-4 shrink-0 text-[#717680]" />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
              className="text-foreground"
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            <SearchResultsList
              query={query}
              searchQuery={searchQuery}
              onSelect={() => setMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
