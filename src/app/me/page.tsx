"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, Grid2x2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar, UserMenu } from "@/components/navbar";
import { PostGrid, StatItem } from "@/components/profile-grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getMe } from "@/lib/api/me";
import { getMyPosts, getMySavedPosts } from "@/lib/api/posts";
import { getApiErrorMessage } from "@/lib/api/axios";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Measured from design/empty-post-dekstop.svg and design/Empty-Post-mobile.svg:
 * heading + 2-3 line body (max-w 412px desktop / 328px mobile, both centered)
 * + a 259px-wide purple pill linking to Add Post. Own-gallery-only — the
 * Saved tab keeps the plain text empty state since no design covers it.
 */
function EmptyGalleryState() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center lg:gap-7.5 lg:py-20">
      <div>
        <h3 className="text-lg font-bold">Your story starts here</h3>
        <p className="mx-auto mt-4.5 max-w-82 text-sm text-muted-foreground lg:mt-5 lg:max-w-103">
          Share your first post and let the world see your moments, passions, and memories. Make this space truly yours.
        </p>
      </div>
      <Link
        href="/feed/new"
        className="flex h-10 w-64.75 items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white hover:bg-primary-200 lg:h-12"
      >
        Upload My First Post
      </Link>
    </div>
  );
}

function MeContent() {
  const router = useRouter();
  const [tab, setTab] = useState<"gallery" | "saved">("gallery");

  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });

  const postsQuery = useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: ({ pageParam }) => getMyPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: tab === "gallery",
  });

  const savedQuery = useInfiniteQuery({
    queryKey: ["mySavedPosts"],
    queryFn: ({ pageParam }) => getMySavedPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: tab === "saved",
  });

  const activeQuery = tab === "gallery" ? postsQuery : savedQuery;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        activeQuery.hasNextPage &&
        !activeQuery.isFetchingNextPage
      ) {
        activeQuery.fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeQuery]);

  if (meQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (meQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-destructive">{getApiErrorMessage(meQuery.error)}</p>
        <Button variant="outline" onClick={() => meQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const { profile, stats } = meQuery.data;
  const posts = activeQuery.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop: avatar, name, Edit Profile, and Messages shortcut all sit in one row. */}
      <div className="hidden items-center gap-4 lg:flex">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-xl">{initials(profile.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/me/edit"
            className="flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground"
          >
            Edit Profile
          </Link>
          <Link
            href="/messages"
            aria-label="Messages"
            className="flex size-12 items-center justify-center rounded-full border border-border text-foreground"
          >
            <Send className="size-5" />
          </Link>
        </div>
      </div>

      {/* Mobile: avatar+name row, then a separate full-width Edit Profile + Messages row below. */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
            <AvatarFallback className="text-xl">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/me/edit"
            className="flex h-9.75 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
          >
            Edit Profile
          </Link>
          <Link
            href="/messages"
            aria-label="Messages"
            className="flex size-9.75 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
          >
            <Send className="size-4" />
          </Link>
        </div>
      </div>

      {profile.bio && <p className="text-sm">{profile.bio}</p>}

      <div className="grid grid-cols-4 rounded-2xl border border-border">
        <StatItem label="Post" value={stats.posts} />
        <StatItem
          label="Followers"
          value={stats.followers}
          onClick={() => router.push("/me/followers")}
        />
        <StatItem
          label="Following"
          value={stats.following}
          onClick={() => router.push("/me/following")}
        />
        <StatItem
          label="Likes"
          value={stats.likes}
          onClick={() => router.push("/me/likes")}
        />
      </div>

      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold",
            tab === "gallery"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Grid2x2 className="size-4" />
          Gallery
        </button>
        <button
          type="button"
          onClick={() => setTab("saved")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold",
            tab === "saved"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Bookmark className="size-4" />
          Saved
        </button>
      </div>

      <PostGrid
        posts={posts}
        isPending={activeQuery.isPending}
        isError={activeQuery.isError}
        emptyMessage={tab === "gallery" ? "No posts yet." : "No saved posts yet."}
        emptyState={tab === "gallery" ? <EmptyGalleryState /> : undefined}
      />
      <div ref={sentinelRef} />
    </div>
  );
}

/** Mobile header matches the pattern established on the public profile page, showing the display name (not username). */
function MobileMeHeader() {
  const router = useRouter();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-3.5 text-foreground" />
        </button>
        <span className="text-lg font-bold">{meQuery.data?.profile.name ?? "Profile"}</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

export default function MePage() {
  return (
    <AuthGuard>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileMeHeader />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-page lg:px-30 lg:pt-10">
        <div className="mx-auto w-full lg:max-w-203">
          <MeContent />
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
