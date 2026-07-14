"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, X } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { CommentComposer } from "@/components/comment-composer";
import { LikesModal } from "@/components/likes-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { deletePost, getPost, likePost, savePost, unlikePost, unsavePost } from "@/lib/api/posts";
import { addComment, deleteComment, getComments } from "@/lib/api/comments";
import { getApiErrorMessage } from "@/lib/api/axios";
import { useAppSelector } from "@/store/hooks";
import type { Comment } from "@/lib/types";

dayjs.extend(relativeTime);

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Measured from design/comment-dekstop.svg and design/comment-mobile.svg:
 * avatar 40px both, row separated by a full-width divider, comment text
 * sits below the avatar/name row (not indented under the avatar).
 */
function CommentRow({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarImage src={comment.author.avatarUrl ?? undefined} alt={comment.author.name} />
          <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {dayjs(comment.createdAt).fromNow()}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-sm">{comment.text}</p>
    </div>
  );
}

function CommentsListBody({
  isPending,
  isEmpty,
  comments,
  currentUserId,
  postAuthorId,
  onDelete,
}: {
  isPending: boolean;
  isEmpty: boolean;
  comments: Comment[];
  currentUserId: number | undefined;
  postAuthorId: number;
  onDelete: (commentId: number) => void;
}) {
  return (
    <>
      {isPending && (
        <div className="flex flex-col gap-4 py-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isPending && isEmpty && (
        <div className="flex flex-col items-center gap-1 py-12 text-center">
          <p className="font-bold">No Comments yet</p>
          <p className="text-sm text-muted-foreground">Start the conversation</p>
        </div>
      )}

      {comments.map((comment) => (
        <CommentRow
          key={comment.id}
          comment={comment}
          canDelete={currentUserId === comment.author.id || currentUserId === postAuthorId}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
    </>
  );
}

function PostDetailContent({ postId }: { postId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [showLikes, setShowLikes] = useState(false);

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
  });

  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => getComments(postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const [liked, setLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);

  const post = postQuery.data;
  const isLiked = liked ?? post?.likedByMe ?? false;
  const displayLikeCount = likeCount ?? post?.likeCount ?? 0;

  const likeMutation = useMutation({
    // onMutate flips `liked` before this runs, so it reflects the target state.
    mutationFn: () => (isLiked ? likePost(postId) : unlikePost(postId)),
    onMutate: () => {
      setLiked(!isLiked);
      setLikeCount(displayLikeCount + (isLiked ? -1 : 1));
    },
    onError: () => {
      setLiked(isLiked);
      setLikeCount(displayLikeCount);
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const saveMutation = useMutation({
    // onMutate flips `saved` before this runs, so it reflects the target state.
    mutationFn: () => (saved ?? false ? savePost(postId) : unsavePost(postId)),
    onMutate: () => setSaved(!(saved ?? false)),
    onSuccess: (data) => {
      setSaved(data.saved);
      queryClient.invalidateQueries({ queryKey: ["mySaved"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => addComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/feed");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (postQuery.isPending) {
    return (
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
        <Skeleton className="aspect-square w-full rounded-lg md:w-180 md:rounded-none" />
        <div className="flex w-full flex-col gap-3 md:w-110">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (postQuery.isError || !post) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-destructive">Couldn&apos;t load this post.</p>
        <button
          type="button"
          onClick={() => postQuery.refetch()}
          className="text-sm font-semibold text-[#7F51F9]"
        >
          Try again
        </button>
      </div>
    );
  }

  const comments = commentsQuery.data?.pages.flatMap((p) => p.comments) ?? [];
  const isOwner = currentUser?.id === post.author.id;
  const comingSoon = () => toast.info("Coming soon");

  return (
    <div className="relative flex w-full flex-col md:flex-row md:gap-5">
      {/* Desktop close button; mobile has its own X floating above the comments sheet below. */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className="absolute -top-10 right-0 hidden text-foreground md:-top-12 md:block"
      >
        <X className="size-6" />
      </button>

      {/* Image: sharp corners + fixed 720 desktop (measured), rounded fluid mobile */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg md:w-180 md:rounded-none">
        <Image
          src={post.imageUrl}
          alt={post.caption || `Post by ${post.author.name}`}
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex w-full min-w-0 flex-col md:w-110">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="size-10">
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
              <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p className="font-bold">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto text-foreground outline-none">
                <MoreHorizontal className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deletePostMutation.mutate()}
                >
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.caption && <p className="mt-4 text-sm">{post.caption}</p>}

        {/*
          Mobile: measured via getBoundingClientRect() (getBBox() alone was
          misleading here — this SVG has multiple transformed groups) from
          design/comment-mobile.svg and design/no-comment-mobile.svg. The
          icon row sits ABOVE the comments sheet on mobile (opposite order
          from desktop), and Comments is a real fixed bottom sheet: a
          full-screen #0A0D12/80 scrim, an opaque rounded-t-2xl sheet
          auto-sized to content up to 62dvh (matches the populated example's
          538/852 ≈ 63%) with internal scroll, and an X that floats a
          constant 14px above the sheet's own top edge in BOTH the
          populated and empty-state exports (not a fixed screen position).
        */}
        <div className="mt-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-7.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => likeMutation.mutate()}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart
                  className={cn(
                    "size-5",
                    isLiked ? "fill-[#B41759] text-[#B41759]" : "text-foreground"
                  )}
                />
              </button>
              <button type="button" onClick={() => setShowLikes(true)} className="text-sm">
                {displayLikeCount}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              <span className="text-sm">{post.commentCount}</span>
            </div>

            <button type="button" onClick={comingSoon} aria-label="Share">
              <Send className="size-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            aria-pressed={saved ?? false}
            aria-label={(saved ?? false) ? "Unsave" : "Save"}
          >
            <Bookmark
              className={cn(
                "size-5",
                saved ?? false ? "fill-foreground text-foreground" : "text-foreground"
              )}
            />
          </button>
        </div>

        <div className="fixed inset-0 z-[60] bg-[#0A0D12]/80 md:hidden" />
        <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end md:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() => router.back()}
            className="mr-5.5 mb-3.5 text-foreground"
          >
            <X className="size-3" strokeWidth={2} />
          </button>
          <div className="flex max-h-[62dvh] w-full flex-col rounded-t-2xl bg-[#0A0D12] px-4 pt-4">
            <h2 className="shrink-0 font-bold">Comments</h2>
            <div className="flex-1 overflow-y-auto">
              <CommentsListBody
                isPending={commentsQuery.isPending}
                isEmpty={commentsQuery.isSuccess && comments.length === 0}
                comments={comments}
                currentUserId={currentUser?.id}
                postAuthorId={post.author.id}
                onDelete={(id) => deleteCommentMutation.mutate(id)}
              />
            </div>
            <div className="shrink-0 py-4">
              <CommentComposer
                onSubmit={(text) => commentMutation.mutate(text)}
                isPending={commentMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Desktop: plain inline list, no sheet/card (per comment-dekstop.svg), icon row comes AFTER comments. */}
        <div className="mt-4 hidden border-t border-border pt-4 md:block">
          <h2 className="font-bold">Comments</h2>
          <div className="max-h-100 overflow-y-auto">
            <CommentsListBody
              isPending={commentsQuery.isPending}
              isEmpty={commentsQuery.isSuccess && comments.length === 0}
              comments={comments}
              currentUserId={currentUser?.id}
              postAuthorId={post.author.id}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
            />
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-between md:flex">
          <div className="flex items-center gap-7.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => likeMutation.mutate()}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart
                  className={cn(
                    "size-5",
                    isLiked ? "fill-[#B41759] text-[#B41759]" : "text-foreground"
                  )}
                />
              </button>
              <button type="button" onClick={() => setShowLikes(true)} className="text-sm">
                {displayLikeCount}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              <span className="text-sm">{post.commentCount}</span>
            </div>

            <button type="button" onClick={comingSoon} aria-label="Share">
              <Send className="size-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            aria-pressed={saved ?? false}
            aria-label={(saved ?? false) ? "Unsave" : "Save"}
          >
            <Bookmark
              className={cn(
                "size-5",
                saved ?? false ? "fill-foreground text-foreground" : "text-foreground"
              )}
            />
          </button>
        </div>

        <div className="mt-4 hidden md:block">
          <CommentComposer
            onSubmit={(text) => commentMutation.mutate(text)}
            isPending={commentMutation.isPending}
          />
        </div>
      </div>

      {showLikes && <LikesModal postId={postId} onClose={() => setShowLikes(false)} />}
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  return (
    <AuthGuard>
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-14 pb-10 md:max-w-295 md:px-0 md:pt-20">
        <PostDetailContent postId={postId} />
      </main>
    </AuthGuard>
  );
}
