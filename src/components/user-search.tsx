"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchUsers } from "@/lib/api/users";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** 300ms debounce, per README 3 "Search memiliki debounced query". */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useUserSearch(query: string) {
  const debounced = useDebouncedValue(query);
  return useQuery({
    queryKey: ["userSearch", debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.trim().length > 0,
  });
}

/**
 * Measured from design/Found-dekstop.svg and design/found-mobile.svg:
 * row height 72px both breakpoints, avatar 48px (r24) both.
 */
export function SearchResultsList({
  query,
  searchQuery,
  onSelect,
}: {
  query: string;
  searchQuery: ReturnType<typeof useUserSearch>;
  onSelect?: () => void;
}) {
  if (query.trim().length === 0) return null;

  if (searchQuery.isPending) {
    return (
      <div className="flex flex-col">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-18 items-center gap-3 px-2">
            <div className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const users = searchQuery.data?.users ?? [];

  if (searchQuery.isError || users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-10 text-center">
        <p className="text-lg font-bold">No results found</p>
        <p className="text-sm text-muted-foreground">Change your keyword</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/profile/${user.username}`}
          onClick={onSelect}
          className="flex h-18 items-center gap-3 px-2"
        >
          <Avatar className="size-12">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
