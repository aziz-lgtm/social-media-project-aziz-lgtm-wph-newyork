"use client";

import { FollowListPage } from "@/components/follow-list-page";
import { getMyFollowing } from "@/lib/api/users";

export default function MyFollowingPage() {
  return <FollowListPage title="Following" queryKey="myFollowing" queryFn={getMyFollowing} />;
}
