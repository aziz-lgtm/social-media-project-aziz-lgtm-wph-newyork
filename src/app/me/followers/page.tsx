"use client";

import { FollowListPage } from "@/components/follow-list-page";
import { getMyFollowers } from "@/lib/api/users";

export default function MyFollowersPage() {
  return <FollowListPage title="Followers" queryKey="myFollowers" queryFn={getMyFollowers} />;
}
