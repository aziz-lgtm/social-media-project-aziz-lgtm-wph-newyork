"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikesModal } from "@/components/likes-modal";
import { cn } from "@/lib/utils";
import { likePost, unlikePost, savePost, unsavePost } from "@/lib/api/posts";
import { useAppSelector } from "@/store/hooks";
import type { Post } from "@/lib/types";

dayjs.extend(relativeTime);

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const CAPTION_LIMIT = 80;

/**
 * Measured from design/feed.svg (desktop) and design/feed-mobile.svg
 * (mobile): card 600px wide / 361px mobile, gap 12 / 8 between elements,
 * header avatar 64px / 44px, image square rounded 8px both (mobile
 * measured 361x353, effectively 1:1), icon row (heart #B41759 when liked
 * / outline otherwise, comment, share, bookmark right-aligned), divider
 * #181D27 at the bottom.
 */
export function PostCard({
  post,
  initiallySaved,
}: {
  post: Post;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(initiallySaved);
  const [expanded, setExpanded] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  /** Guests get sent to login instead of firing a request that will 401. */
  const requireAuth = () => {
    if (user) return true;
    router.push("/login");
    return false;
  };

  const likeMutation = useMutation({
    // onMutate flips `liked` before this runs, so it reflects the target state.
    mutationFn: () => (liked ? likePost(post.id) : unlikePost(post.id)),
    onMutate: () => {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const saveMutation = useMutation({
    // onMutate flips `saved` before this runs, so it reflects the target state.
    mutationFn: () => (saved ? savePost(post.id) : unsavePost(post.id)),
    onMutate: () => setSaved((v) => !v),
    onError: () => setSaved((v) => !v),
    onSuccess: (data) => {
      setSaved(data.saved);
      queryClient.invalidateQueries({ queryKey: ["mySaved"] });
    },
  });

  const captionText = post.caption ?? "";
  const isLong = captionText.length > CAPTION_LIMIT;
  const caption =
    expanded || !isLong
      ? captionText
      : captionText.slice(0, CAPTION_LIMIT).trimEnd() + "...";

  const comingSoon = () => toast.info("Coming soon");

  return (
    <article className="flex w-full flex-col gap-2 md:gap-3">
      <Link
        href={`/profile/${post.author.username}`}
        className="flex items-center gap-3 text-left"
      >
        <Avatar className="size-11 md:size-16">
          <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
          <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{post.author.name}</p>
          <p className="text-sm text-[#A4A7AE]">{dayjs(post.createdAt).fromNow()}</p>
        </div>
      </Link>

      <Link
        href={`/posts/${post.id}`}
        className="relative block aspect-square w-full overflow-hidden rounded-lg"
      >
        <Image
          src={post.imageUrl}
          alt={post.caption || `Post by ${post.author.name}`}
          fill
          sizes="(min-width: 768px) 600px, 361px"
          className="object-cover"
        />
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-7.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => requireAuth() && likeMutation.mutate()}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn(
                  "size-5",
                  liked ? "fill-[#B41759] text-[#B41759]" : "text-foreground"
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => setShowLikes(true)}
              className="text-sm"
            >
              {likeCount}
            </button>
          </div>

          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-2"
            aria-label="Comments"
          >
            <MessageCircle className="size-5" />
            <span className="text-sm">{post.commentCount}</span>
          </Link>

          <button
            type="button"
            onClick={comingSoon}
            aria-label="Share"
          >
            <Send className="size-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => requireAuth() && saveMutation.mutate()}
          aria-pressed={saved}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark
            className={cn(
              "size-5",
              saved ? "fill-foreground text-foreground" : "text-foreground"
            )}
          />
        </button>
      </div>

      <div>
        <Link href={`/profile/${post.author.username}`} className="font-bold">
          {post.author.name}
        </Link>
        {post.caption && (
          <p className="mt-1 text-sm">
            {caption}{" "}
            {isLong && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="font-medium text-[#7F51F9]"
              >
                Show More
              </button>
            )}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-border" />

      {showLikes && (
        <LikesModal postId={post.id} onClose={() => setShowLikes(false)} />
      )}
    </article>
  );
}
