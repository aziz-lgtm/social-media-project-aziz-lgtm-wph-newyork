"use client";

import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/lib/types";

export function StatItem({
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
export function PostGrid({
  posts,
  isPending,
  isError,
  emptyMessage,
  emptyState,
}: {
  posts: Post[];
  isPending: boolean;
  isError: boolean;
  emptyMessage: string;
  /** Optional richer empty state (e.g. own-profile "Upload My First Post" CTA) instead of the plain text message. */
  emptyState?: React.ReactNode;
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-0.5 lg:gap-1">
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
    if (emptyState) return <>{emptyState}</>;
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 lg:gap-1">
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
