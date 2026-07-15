"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getExplorePosts, getMySaved } from "@/lib/api/posts";
import { useAppSelector } from "@/store/hooks";

function ExploreFeedSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full lg:size-16" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-lg" />
    </div>
  );
}

/**
 * The public/explore timeline (`/api/posts`) — shared by the guest homepage
 * (`/`) and the logged-in `/explore` page reachable from the Home icon's
 * submenu. Cross-references save-state via /api/me/saved when logged in,
 * same as /feed; guests always see initiallySaved=false since they have no
 * saved posts and the save action redirects them to login anyway.
 */
export function ExploreFeed() {
  const currentUser = useAppSelector((s) => s.auth.user);

  const savedQuery = useQuery({
    queryKey: ["mySaved"],
    queryFn: getMySaved,
    enabled: !!currentUser,
  });

  const exploreQuery = useInfiniteQuery({
    queryKey: ["explore"],
    queryFn: ({ pageParam }) => getExplorePosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        exploreQuery.hasNextPage &&
        !exploreQuery.isFetchingNextPage
      ) {
        exploreQuery.fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [exploreQuery]);

  if (exploreQuery.isPending) {
    return (
      <div className="flex w-full flex-col gap-4 lg:gap-6">
        <ExploreFeedSkeleton />
        <ExploreFeedSkeleton />
      </div>
    );
  }

  if (exploreQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-destructive">Couldn&apos;t load posts.</p>
        <button
          type="button"
          onClick={() => exploreQuery.refetch()}
          className="text-sm font-semibold text-primary-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 lg:gap-6">
      {exploreQuery.data.pages
        .flatMap((p) => p.items)
        .map((post) => (
          <PostCard
            key={post.id}
            post={post}
            initiallySaved={savedQuery.data?.has(post.id) ?? false}
          />
        ))}
      <div ref={sentinelRef} />
      {exploreQuery.isFetchingNextPage && <ExploreFeedSkeleton />}
    </div>
  );
}
