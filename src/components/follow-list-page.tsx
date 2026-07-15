"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { FollowButton } from "@/components/follow-button";
import { Navbar, UserMenu } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** No design was provided for these — self-designed, reusing the exact row markup already measured for the Followers/Following pop-ups (avatar 48px, FollowButton size="sm"). */
function MobileHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <span className="text-lg font-bold">{title}</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

export function FollowListPage({
  title,
  queryKey,
  queryFn,
}: {
  title: string;
  queryKey: string;
  queryFn: (page: number) => Promise<SearchResult>;
}) {
  const router = useRouter();
  const query = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const users = query.data?.pages.flatMap((p) => p.users) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [query]);

  return (
    <AuthGuard>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileHeader title={title} />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-137 lg:px-0 lg:pt-10">
        <div className="mb-6 hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <h1 className="text-display-xs font-bold">{title}</h1>
        </div>

        <div className="flex flex-col">
          {query.isPending &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}

          {query.isError && (
            <p className="py-10 text-center text-sm text-destructive">
              Couldn&apos;t load the list.
            </p>
          )}

          {query.isSuccess && users.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {title === "Followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          )}

          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 py-4">
              <Link href={`/profile/${user.username}`} className="flex min-w-0 items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-md font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.username}</p>
                </div>
              </Link>
              <FollowButton
                username={user.username}
                initialFollowing={user.isFollowedByMe}
                size="sm"
              />
            </div>
          ))}
        </div>
        <div ref={sentinelRef} />
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
