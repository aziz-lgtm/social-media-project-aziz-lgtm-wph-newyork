"use client";

import { BottomNav } from "@/components/bottom-nav";
import { ExploreFeed } from "@/components/explore-feed";
import { Navbar } from "@/components/navbar";

/**
 * Public timeline, reachable from the Home icon's Home/Explore submenu in
 * BottomNav. No AuthGuard — works logged-out too (same content as the guest
 * homepage), since a logged-in user switching over here isn't doing
 * anything private.
 */
export default function ExplorePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-90.25 flex-1 pt-4 pb-32 lg:max-w-150 lg:pt-10">
        <ExploreFeed />
      </main>
      <BottomNav />
    </>
  );
}
