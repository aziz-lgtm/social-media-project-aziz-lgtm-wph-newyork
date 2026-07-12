"use client";

import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowButton } from "@/components/follow-button";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ListUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

/**
 * Shared shell for Likes/Followers/Following pop-ups — same layout,
 * just a different title, data source, and empty-state copy. Measured
 * from design/Likes.svg and design/Likes-mobile.svg: scrim #0A0D12 @
 * 80% opacity, desktop bordered card (548x570, rounded-lg, p-6),
 * mobile no card (rows float on the scrim), 48px avatars, 76px rows.
 */
export function UserListModal({
  title,
  onClose,
  users,
  isPending,
  isError,
  emptyMessage,
}: {
  title: string;
  onClose: () => void;
  users: ListUser[] | undefined;
  isPending: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
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
          <h2 className="text-xl font-bold">{title}</h2>

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
                Couldn&apos;t load the list.
              </p>
            )}

            {users && users.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">{emptyMessage}</p>
            )}

            {users?.map((user) => (
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
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                </div>
                <FollowButton
                  username={user.username}
                  initialFollowing={user.isFollowedByMe}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
