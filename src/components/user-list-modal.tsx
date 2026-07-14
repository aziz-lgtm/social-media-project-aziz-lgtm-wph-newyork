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

function UserRows({
  users,
  isPending,
  isError,
  emptyMessage,
}: {
  users: ListUser[] | undefined;
  isPending: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="flex flex-col">
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
        <p className="py-4 text-sm text-destructive">Couldn&apos;t load the list.</p>
      )}

      {users && users.length === 0 && (
        <p className="py-4 text-sm text-muted-foreground">{emptyMessage}</p>
      )}

      {users?.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3 py-4">
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
          <FollowButton username={user.username} initialFollowing={user.isFollowedByMe} size="sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shared shell for Likes/Followers/Following pop-ups. Desktop and mobile
 * are NOT the same layout — measured separately from design/Likes.svg
 * and design/Likes-mobile.svg:
 *
 * - Desktop: translucent scrim (#0A0D12 @ 80%) over the whole screen,
 *   with a small centered OPAQUE card (548 wide, rounded-lg, border,
 *   solid #0A0D12 bg, p-6) floating on it. X sits just above the card.
 *
 * - Mobile: the scrim only dims the top portion. Below that is a
 *   completely SEPARATE, fully OPAQUE bottom-sheet panel — found as a
 *   <path> (not a <rect>, easy to miss), full width, rounded-t-2xl
 *   (16px), pinned to the bottom, auto-sized to its content up to
 *   max-h-[62dvh] (in the reference example: 526/852 ≈ 62%, starting at
 *   y=326 on an 852px-tall canvas — but that y is NOT a fixed constant,
 *   it moves with however many rows are in the list). The X close icon
 *   floats a constant 14px above the sheet's own top edge in every
 *   measured example, not at a fixed screen position — so it's a sibling
 *   inside the same items-end flex column as the sheet (mb-3.5), which
 *   tracks the sheet's real height instead of assuming one.
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
    <>
      <div className="fixed inset-0 z-[60] bg-[#0A0D12]/80" />

      {/* Desktop: X above a small centered opaque card */}
      <div className="fixed inset-0 z-[60] hidden items-start justify-center overflow-y-auto px-4 py-14 md:flex">
        <div className="flex w-full max-w-137 flex-col items-end gap-4">
          <button type="button" aria-label="Close" onClick={onClose} className="text-foreground">
            <X className="size-3" strokeWidth={2} />
          </button>
          <div className="w-full rounded-lg border border-border bg-[#0A0D12] p-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="mt-4">
              <UserRows users={users} isPending={isPending} isError={isError} emptyMessage={emptyMessage} />
            </div>
          </div>
        </div>
      </div>

      {/*
        Mobile: the sheet auto-sizes to its content (up to max-h-[62dvh]) —
        fewer users means a shorter sheet. The X must track the sheet's
        actual top edge (measured as a constant 14px gap above it via
        getBoundingClientRect on Likes-mobile.svg), not sit at a fixed
        screen position, or it floats disconnected above a short sheet.
      */}
      <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end md:hidden">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="mr-5.5 mb-3.5 text-foreground"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
        <div className="flex max-h-[62dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-[#0A0D12] px-4 pt-4 pb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <UserRows users={users} isPending={isPending} isError={isError} emptyMessage={emptyMessage} />
        </div>
      </div>
    </>
  );
}
