import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  FeedResult,
  Post,
  PostLikesResult,
} from "@/lib/types";

export async function getFeed(page: number): Promise<FeedResult> {
  const res = await api.get<ApiResponse<FeedResult>>("/api/feed", {
    params: { page, limit: 10 },
  });
  return res.data.data;
}

export async function likePost(id: number) {
  const res = await api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
    `/api/posts/${id}/like`
  );
  return res.data.data;
}

export async function unlikePost(id: number) {
  const res = await api.delete<ApiResponse<{ liked: boolean; likeCount: number }>>(
    `/api/posts/${id}/like`
  );
  return res.data.data;
}

export async function savePost(id: number) {
  const res = await api.post<ApiResponse<{ saved: boolean }>>(
    `/api/posts/${id}/save`
  );
  return res.data.data;
}

export async function unsavePost(id: number) {
  const res = await api.delete<ApiResponse<{ saved: boolean }>>(
    `/api/posts/${id}/save`
  );
  return res.data.data;
}

export async function getPostLikes(id: number): Promise<PostLikesResult> {
  const res = await api.get<ApiResponse<PostLikesResult>>(
    `/api/posts/${id}/likes`
  );
  return res.data.data;
}

export async function getMySaved(): Promise<Set<number>> {
  const res = await api.get<ApiResponse<{ posts: Pick<Post, "id">[] }>>(
    "/api/me/saved",
    { params: { limit: 50 } }
  );
  return new Set(res.data.data.posts.map((p) => p.id));
}
