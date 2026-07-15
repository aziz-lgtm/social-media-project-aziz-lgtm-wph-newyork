"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/lib/dm";
import { useAppSelector } from "@/store/hooks";

dayjs.extend(relativeTime);

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MessagesContent() {
  const user = useAppSelector((s) => s.auth.user);
  const { conversations, loaded } = useConversations(user?.id);

  const threads = Object.values(conversations)
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.createdAt ?? "";
      const bLast = b.messages[b.messages.length - 1]?.createdAt ?? "";
      return bLast.localeCompare(aLast);
    });

  if (!loaded) return null;

  if (threads.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-bold">No messages yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start a conversation from someone&apos;s profile.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {threads.map((thread) => {
        const last = thread.messages[thread.messages.length - 1];
        return (
          <Link
            key={thread.username}
            href={`/messages/${thread.username}`}
            className="flex items-center gap-3 border-b border-border py-4 last:border-b-0"
          >
            <Avatar className="size-12">
              <AvatarImage src={thread.avatarUrl ?? undefined} alt={thread.name} />
              <AvatarFallback>{initials(thread.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-md font-bold">{thread.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {last.from === "me" ? "You: " : ""}
                {last.text}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {dayjs(last.createdAt).fromNow()}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-150 lg:pt-10">
        <h1 className="mb-4 text-xl font-bold">Messages</h1>
        <MessagesContent />
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
