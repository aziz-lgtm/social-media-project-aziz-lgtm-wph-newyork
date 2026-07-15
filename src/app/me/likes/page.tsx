"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar, UserMenu } from "@/components/navbar";
import { PostGrid } from "@/components/profile-grid";
import { getMyLikes } from "@/lib/api/posts";

// No design was provided for this page — self-designed, reusing the same
// mobile-header + PostGrid pattern already established for /me/followers
// and /me's own Gallery/Saved tabs.
function MobileHeader() {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <span className="text-lg font-bold">Likes</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

export default function MyLikesPage() {
  const router = useRouter();
  const query = useInfiniteQuery({
    queryKey: ["myLikes"],
    queryFn: ({ pageParam }) => getMyLikes(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const posts = query.data?.pages.flatMap((p) => p.posts) ?? [];
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
      <MobileHeader />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-150 lg:px-0 lg:pt-10">
        <div className="mb-6 hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <h1 className="text-display-xs font-bold">Likes</h1>
        </div>

        <PostGrid
          posts={posts}
          isPending={query.isPending}
          isError={query.isError}
          emptyMessage="No liked posts yet."
        />
        <div ref={sentinelRef} />
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
