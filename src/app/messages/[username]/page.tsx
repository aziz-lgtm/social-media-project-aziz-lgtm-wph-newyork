"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConversations } from "@/lib/dm";
import { getPublicProfile } from "@/lib/api/users";
import { useAppSelector } from "@/store/hooks";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Mobile header matches the pattern from the public profile page: back arrow + peer name. */
function MobileThreadHeader({ name }: { name: string }) {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-black px-4 md:hidden">
      <button type="button" onClick={() => router.back()} aria-label="Back">
        <ArrowLeft className="size-5 text-foreground" />
      </button>
      <span className="text-lg font-bold">{name}</span>
    </header>
  );
}

function ThreadContent({ username }: { username: string }) {
  const currentUser = useAppSelector((s) => s.auth.user);
  const { conversations, loaded, ensureConversation, sendMessage } = useConversations(
    currentUser?.id
  );
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const profileQuery = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => getPublicProfile(username),
  });

  useEffect(() => {
    if (profileQuery.data) {
      ensureConversation({
        username: profileQuery.data.username,
        name: profileQuery.data.name,
        avatarUrl: profileQuery.data.avatarUrl,
      });
    }
  }, [profileQuery.data, ensureConversation]);

  const messages = conversations[username]?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (profileQuery.isPending || !loaded) {
    return (
      <div className="flex items-center gap-3 px-4 py-4">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <p className="px-4 py-10 text-center text-sm text-destructive">
        Couldn&apos;t load this user.
      </p>
    );
  }

  const peer = profileQuery.data;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ username: peer.username, name: peer.name, avatarUrl: peer.avatarUrl }, trimmed);
    setText("");
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col md:h-[calc(100svh-5rem)]">
      <div className="hidden items-center gap-3 border-b border-border px-4 py-4 md:flex">
        <Avatar className="size-10">
          <AvatarImage src={peer.avatarUrl ?? undefined} alt={peer.name} />
          <AvatarFallback>{initials(peer.name)}</AvatarFallback>
        </Avatar>
        <span className="font-bold">{peer.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Say hi to {peer.name} 👋
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col",
                  message.from === "me" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    message.from === "me"
                      ? "bg-[#6936F2] text-white"
                      : "border border-border bg-[#0A0D12] text-foreground"
                  )}
                >
                  {message.text}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">
                  {dayjs(message.createdAt).format("HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Message..."
          className="h-12 flex-1 rounded-full border border-border bg-[#0A0D12] px-4 text-sm text-foreground outline-none placeholder:text-[#535862]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Send"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6936F2] text-white hover:bg-[#7F51F9] disabled:opacity-60"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  // Shares cache with the identical query inside ThreadContent — this
  // doesn't refetch, it just lets the mobile header show the real display
  // name instead of the raw username while that request is in flight.
  const profileQuery = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => getPublicProfile(username),
  });

  return (
    <AuthGuard>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <MobileThreadHeader name={profileQuery.data?.name ?? username} />
      <main className="mx-auto w-full max-w-90.25 flex-1 md:max-w-150">
        <ThreadContent username={username} />
      </main>
    </AuthGuard>
  );
}
