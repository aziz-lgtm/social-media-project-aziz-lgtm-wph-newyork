"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function UserMenu({ size }: { size: "desktop" | "mobile" }) {
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

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info("User search is coming soon");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black">
      {/* Desktop: 1440×80, px-120 */}
      <div className="mx-auto hidden h-20 w-full max-w-page items-center justify-between gap-6 px-30 md:flex">
        <Link href="/feed" className="flex shrink-0 items-center gap-3">
          <Logo className="text-foreground" />
          <span className="text-2xl font-bold text-foreground">Sociality</span>
        </Link>

        <form
          onSubmit={onSearchSubmit}
          className="flex h-12 w-full max-w-122.75 items-center gap-2 rounded-full border border-border bg-[#0A0D12] px-4"
        >
          <Search className="size-4 shrink-0 text-[#717680]" />
          <input
            type="search"
            placeholder="Search"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </form>

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
            onClick={() => toast.info("User search is coming soon")}
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
    </header>
  );
}
