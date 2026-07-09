"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

export default function FeedPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="text-xl font-semibold">Feed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your timeline is coming on Day 2. Follow people to see their posts
          here.
        </p>
      </main>
    </AuthGuard>
  );
}
