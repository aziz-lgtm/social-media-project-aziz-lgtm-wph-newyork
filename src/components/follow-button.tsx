"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { followUser, unfollowUser } from "@/lib/api/follow";
import { useAppSelector } from "@/store/hooks";

/**
 * Non-optimistic on purpose: state is seeded from a prop (only rendered
 * once that data has loaded), and mutationFn reads `following` in its
 * natural pre-click sense with no onMutate flip. An optimistic flip here
 * races the mutationFn closure — see the like/save mutation bug documented
 * on PostCard.
 */
export function FollowButton({
  username,
  initialFollowing,
  onChanged,
  size = "md",
}: {
  username: string;
  initialFollowing: boolean;
  onChanged?: (following: boolean) => void;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [following, setFollowing] = useState(initialFollowing);

  const mutation = useMutation({
    mutationFn: () =>
      following ? unfollowUser(username) : followUser(username),
    onSuccess: (data) => {
      setFollowing(data.following);
      onChanged?.(data.following);
    },
  });

  if (currentUser?.username === username) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (!currentUser) {
          router.push("/login");
          return;
        }
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className={cn(
        "shrink-0 rounded-full font-semibold transition-colors disabled:opacity-60",
        size === "md" ? "h-12 px-6 text-sm" : "h-9.75 px-4 text-sm",
        following
          ? "border border-border text-foreground"
          : "bg-[#6936F2] text-white hover:bg-[#7F51F9]"
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
