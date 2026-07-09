"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

function UserMenu({ size }: { size: "desktop" | "mobile" }) {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
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
            dispatch(logout());
            router.replace("/login");
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info("User search is coming soon");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black">
      {/* Desktop: 1440×80, px-120 */}
      <div className="mx-auto hidden h-20 max-w-[1440px] items-center justify-between gap-6 px-8 md:flex xl:px-[120px]">
        <Link href="/feed" className="flex shrink-0 items-center gap-3">
          <Logo className="text-foreground" />
          <span className="text-2xl font-bold text-foreground">Sociality</span>
        </Link>

        <form
          onSubmit={onSearchSubmit}
          className="flex h-12 w-full max-w-[491px] items-center gap-2 rounded-full border border-border bg-[#0A0D12] px-4"
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
          <UserMenu size="mobile" />
        </div>
      </div>
    </header>
  );
}
