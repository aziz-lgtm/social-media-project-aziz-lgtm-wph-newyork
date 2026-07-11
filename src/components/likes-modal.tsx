"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostLikes } from "@/lib/api/posts";
import { followUser, unfollowUser } from "@/lib/api/follow";
import { cn } from "@/lib/utils";
import type { LikeUser } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function FollowButton({ user }: { user: LikeUser }) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(user.isFollowedByMe);

  const mutation = useMutation({
    mutationFn: () =>
      following ? unfollowUser(user.username) : followUser(user.username),
    onSuccess: (data) => {
      setFollowing(data.following);
      queryClient.invalidateQueries({ queryKey: ["postLikes"] });
    },
  });

  if (user.isMe) return null;

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      className={cn(
        "h-9.75 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-60",
        following
          ? "border border-border text-foreground"
          : "bg-[#6936F2] text-white hover:bg-[#7F51F9]"
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

/**
 * Measured from design/Likes.svg (desktop) and design/Likes-mobile.svg:
 * scrim #0A0D12 @ 80% opacity on both (not black/70 as previously
 * assumed). Desktop: bordered card 548x570 top 227, rounded-lg, p-6.
 * Mobile: no card — rows float directly on the scrim with just px-4.
 * Both: X close icon above the content, 48px avatars (r24), 76px rows,
 * Follow (solid #6936F2) / Following (outline) buttons.
 */
export function LikesModal({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["postLikes", postId],
    queryFn: () => getPostLikes(postId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0A0D12]/80 px-4 py-14">
      <div className="flex w-full max-w-137 flex-col items-end gap-4">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="text-foreground"
        >
          <X className="size-3" strokeWidth={2} />
        </button>

        <div className="w-full md:rounded-lg md:border md:border-border md:bg-[#0A0D12] md:p-6">
          <h2 className="text-xl font-bold">Likes</h2>

          <div className="mt-4 flex flex-col">
            {isPending &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}

            {isError && (
              <p className="py-4 text-sm text-destructive">
                Couldn&apos;t load likes.
              </p>
            )}

            {data && data.users.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">
                No likes yet.
              </p>
            )}

            {data?.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 py-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                </div>
                <FollowButton user={user} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
