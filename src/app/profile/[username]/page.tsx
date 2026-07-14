"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Grid2x2, Heart, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { FollowButton } from "@/components/follow-button";
import { FollowListModal } from "@/components/follow-list-modal";
import { Navbar, UserMenu } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/axios";
import { getPublicProfile, getUserLikes, getUserPosts } from "@/lib/api/users";
import type { Post } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatItem({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const className = "flex flex-col items-center border-r border-border py-2 last:border-r-0";
  const content = (
    <>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </>
  );

  if (!onClick) return <div className={className}>{content}</div>;

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/** Measured square grid cells: desktop 268px/gap-1(4px), mobile ~119px/gap-0.5(2px), both 3 columns. */
function PostGrid({
  posts,
  isPending,
  isError,
  emptyMessage,
}: {
  posts: Post[];
  isPending: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-0.5 md:gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        Couldn&apos;t load posts.
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="relative aspect-square w-full overflow-hidden"
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post"}
            fill
            sizes="(min-width: 768px) 268px, 130px"
            className="object-cover"
          />
        </Link>
      ))}
    </div>
  );
}

function ProfileContent({ username }: { username: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"gallery" | "liked">("gallery");
  const [followListOpen, setFollowListOpen] = useState<
    "followers" | "following" | null
  >(null);

  const profileQuery = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => getPublicProfile(username),
  });

  useEffect(() => {
    if (profileQuery.data?.isMe) router.replace("/me");
  }, [profileQuery.data?.isMe, router]);

  const postsQuery = useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam }) => getUserPosts(username, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: tab === "gallery",
  });

  const likesQuery = useInfiniteQuery({
    queryKey: ["userLikes", username],
    queryFn: ({ pageParam }) => getUserLikes(username, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: tab === "liked",
  });

  const activeQuery = tab === "gallery" ? postsQuery : likesQuery;
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

  if (profileQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
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

  if (profileQuery.isError) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-bold">User not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(profileQuery.error)}
        </p>
      </div>
    );
  }

  const profile = profileQuery.data;
  const posts = activeQuery.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop: avatar, name, Follow button, and Message button all sit in one row. */}
      <div className="hidden items-center gap-4 md:flex">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-xl">{initials(profile.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <FollowButton
            username={username}
            initialFollowing={profile.isFollowing}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: ["publicProfile", username] })
            }
          />
          <Link
            href={`/messages/${username}`}
            aria-label="Message"
            className="flex size-12 items-center justify-center rounded-full border border-border text-foreground"
          >
            <Send className="size-5" />
          </Link>
        </div>
      </div>

      {/* Mobile: avatar+name row, then a separate full-width Follow + Message row below. */}
      <div className="flex flex-col gap-4 md:hidden">
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
          <FollowButton
            username={username}
            initialFollowing={profile.isFollowing}
            size="sm"
            className="flex-1"
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: ["publicProfile", username] })
            }
          />
          <Link
            href={`/messages/${username}`}
            aria-label="Message"
            className="flex size-9.75 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
          >
            <Send className="size-4" />
          </Link>
        </div>
      </div>

      {profile.bio && <p className="text-sm">{profile.bio}</p>}

      <div className="grid grid-cols-4 rounded-2xl border border-border">
        <StatItem label="Post" value={profile.counts.post} />
        <StatItem
          label="Followers"
          value={profile.counts.followers}
          onClick={() => setFollowListOpen("followers")}
        />
        <StatItem
          label="Following"
          value={profile.counts.following}
          onClick={() => setFollowListOpen("following")}
        />
        <StatItem label="Likes" value={profile.counts.likes} />
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
          onClick={() => setTab("liked")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold",
            tab === "liked"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Heart className="size-4" />
          Liked
        </button>
      </div>

      <PostGrid
        posts={posts}
        isPending={activeQuery.isPending}
        isError={activeQuery.isError}
        emptyMessage={tab === "gallery" ? "No posts yet." : "No liked posts yet."}
      />
      <div ref={sentinelRef} />

      {followListOpen && (
        <FollowListModal
          username={username}
          mode={followListOpen}
          onClose={() => setFollowListOpen(null)}
        />
      )}
    </div>
  );
}

/** Mobile header measured from design/someone-else-*-mobile.svg: back arrow + page title + own avatar, replacing the standard Navbar on mobile only. */
function MobileProfileHeader({ username }: { username: string }) {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 md:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <span className="text-lg font-bold">{username}</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  return (
    <>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <MobileProfileHeader username={username} />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 md:max-w-page md:px-30 md:pt-10">
        <div className="mx-auto w-full md:max-w-203">
          <ProfileContent username={username} />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
