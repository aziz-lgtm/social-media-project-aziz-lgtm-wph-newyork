"use client";

import { useQuery } from "@tanstack/react-query";
import { UserListModal } from "@/components/user-list-modal";
import { getPostLikes } from "@/lib/api/posts";

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
    <UserListModal
      title="Likes"
      onClose={onClose}
      users={data?.users}
      isPending={isPending}
      isError={isError}
      emptyMessage="No likes yet."
    />
  );
}
