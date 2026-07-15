"use client";

import Link from "next/link";
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
          <FollowButton username={user.username} initialFollowing={user.isFollowedByMe} size="sm" />
        </div>
      ))}
    </div>
  );
}

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
      <div className="fixed inset-0 z-60 bg-neutral-950/80" />

      <div className="fixed inset-0 z-60 hidden items-start justify-center overflow-y-auto px-4 py-14 lg:flex">
        <div className="flex w-full max-w-137 flex-col items-end gap-4">
          <button type="button" aria-label="Close" onClick={onClose} className="text-foreground">
            <X className="size-3" strokeWidth={2} />
          </button>
          <div className="w-full rounded-lg border border-border bg-neutral-950 p-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="mt-4">
              <UserRows users={users} isPending={isPending} isError={isError} emptyMessage={emptyMessage} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-60 flex flex-col items-end lg:hidden">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="mr-5.5 mb-3.5 text-foreground"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
        <div className="flex max-h-[62dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-neutral-950 px-4 pt-4 pb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <UserRows users={users} isPending={isPending} isError={isError} emptyMessage={emptyMessage} />
        </div>
      </div>
    </>
  );
}
