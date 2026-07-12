"use client";

import { useQuery } from "@tanstack/react-query";
import { UserListModal } from "@/components/user-list-modal";
import { getFollowers, getFollowing } from "@/lib/api/users";

export function FollowListModal({
  username,
  mode,
  onClose,
}: {
  username: string;
  mode: "followers" | "following";
  onClose: () => void;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: [mode, username],
    queryFn: () =>
      mode === "followers" ? getFollowers(username, 1) : getFollowing(username, 1),
  });

  return (
    <UserListModal
      title={mode === "followers" ? "Followers" : "Following"}
      onClose={onClose}
      users={data?.users}
      isPending={isPending}
      isError={isError}
      emptyMessage={
        mode === "followers" ? "No followers yet." : "Not following anyone yet."
      }
    />
  );
}
