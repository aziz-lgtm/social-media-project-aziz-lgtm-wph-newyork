"use client";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/lib/api/me";
import { getApiErrorMessage } from "@/lib/api/axios";

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function MeContent() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const { profile, stats } = data;
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="text-xs text-muted-foreground">
            Joined {dayjs(profile.createdAt).format("MMMM YYYY")}
          </p>
        </div>
      </div>

      {profile.bio && <p className="text-sm">{profile.bio}</p>}

      <div className="grid grid-cols-4 rounded-2xl border border-border bg-card py-4">
        <StatItem label="Posts" value={stats.posts} />
        <StatItem label="Followers" value={stats.followers} />
        <StatItem label="Following" value={stats.following} />
        <StatItem label="Likes" value={stats.likes} />
      </div>

      <p className="text-sm text-muted-foreground">
        Posts, Saved, and Likes tabs are coming in the next days.
      </p>
    </div>
  );
}

export default function MePage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 pb-32">
        <MeContent />
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
