"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar } from "@/components/navbar";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getExplorePosts } from "@/lib/api/posts";
import { useAppSelector } from "@/store/hooks";

function GuestFeedSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full md:size-16" />
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
 * Guest homepage: measured from design/Before-Login.svg — same Navbar
 * (guest state: Login/Register inline desktop, hamburger toggle mobile)
 * and BottomNav as the logged-in feed, but backed by the public
 * /api/posts "explore" endpoint since /api/feed requires auth.
 */
function GuestHome() {
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

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-90.25 flex-1 pt-4 pb-32 md:max-w-150 md:pt-10">
        {exploreQuery.isPending && (
          <div className="flex w-full flex-col gap-4 md:gap-6">
            <GuestFeedSkeleton />
            <GuestFeedSkeleton />
          </div>
        )}

        {exploreQuery.isError && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-destructive">Couldn&apos;t load posts.</p>
            <button
              type="button"
              onClick={() => exploreQuery.refetch()}
              className="text-sm font-semibold text-[#7F51F9]"
            >
              Try again
            </button>
          </div>
        )}

        {exploreQuery.isSuccess && (
          <div className="flex w-full flex-col gap-4 md:gap-6">
            {exploreQuery.data.pages
              .flatMap((p) => p.items)
              .map((post) => (
                <PostCard key={post.id} post={post} initiallySaved={false} />
              ))}
            <div ref={sentinelRef} />
            {exploreQuery.isFetchingNextPage && <GuestFeedSkeleton />}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default function Home() {
  const { token, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && token) router.replace("/feed");
  }, [hydrated, token, router]);

  if (!hydrated || token) return null;

  return <GuestHome />;
}
