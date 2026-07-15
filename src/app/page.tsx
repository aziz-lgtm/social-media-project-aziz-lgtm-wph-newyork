"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ExploreFeed } from "@/components/explore-feed";
import { Navbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";

/*
 * Guest homepage: measured from design/Before-Login.svg — same Navbar
 * (guest state: Login/Register inline desktop, hamburger toggle mobile)
 * and BottomNav as the logged-in feed, but backed by the public
 * /api/posts "explore" endpoint since /api/feed requires auth. Shares its
 * feed-rendering with the logged-in /explore page via ExploreFeed.
 */
function GuestHome() {
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

export default function Home() {
  const { token, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && token) router.replace("/feed");
  }, [hydrated, token, router]);

  if (!hydrated || token) return null;

  return <GuestHome />;
}
