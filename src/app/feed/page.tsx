"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar } from "@/components/navbar";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeed, getMySaved } from "@/lib/api/posts";

function FeedSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-lg" />
    </div>
  );
}

function FeedContent() {
  const savedQuery = useQuery({ queryKey: ["mySaved"], queryFn: getMySaved });

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeed(pageParam),
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
      if (entries[0].isIntersecting && feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
        feedQuery.fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [feedQuery]);

  if (feedQuery.isPending) {
    return (
      <div className="flex w-full flex-col gap-4 md:gap-6">
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  if (feedQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-destructive">Couldn&apos;t load your feed.</p>
        <button
          type="button"
          onClick={() => feedQuery.refetch()}
          className="text-sm font-semibold text-[#7F51F9]"
        >
          Try again
        </button>
      </div>
    );
  }

  const posts = feedQuery.data.pages.flatMap((p) => p.items);

  if (posts.length === 0) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-bold">Your feed is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Follow people to see their posts here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          initiallySaved={savedQuery.data?.has(post.id) ?? false}
        />
      ))}
      <div ref={sentinelRef} />
      {feedQuery.isFetchingNextPage && <FeedSkeleton />}
    </div>
  );
}

export default function FeedPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-90.25 flex-1 pt-4 pb-32 md:max-w-150 md:pt-10">
        <FeedContent />
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
