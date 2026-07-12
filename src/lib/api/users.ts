import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  PublicProfile,
  SearchResult,
  UserPostsResult,
} from "@/lib/types";

export async function searchUsers(q: string): Promise<SearchResult> {
  const res = await api.get<ApiResponse<SearchResult>>("/api/users/search", {
    params: { q, limit: 20 },
  });
  return res.data.data;
}

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const res = await api.get<ApiResponse<PublicProfile>>(
    `/api/users/${encodeURIComponent(username)}`
  );
  return res.data.data;
}

export async function getUserPosts(
  username: string,
  page: number
): Promise<UserPostsResult> {
  const res = await api.get<ApiResponse<UserPostsResult>>(
    `/api/users/${encodeURIComponent(username)}/posts`,
    { params: { page, limit: 12 } }
  );
  return res.data.data;
}

export async function getUserLikes(
  username: string,
  page: number
): Promise<UserPostsResult> {
  const res = await api.get<ApiResponse<UserPostsResult>>(
    `/api/users/${encodeURIComponent(username)}/likes`,
    { params: { page, limit: 12 } }
  );
  return res.data.data;
}

export async function getFollowers(
  username: string,
  page: number
): Promise<SearchResult> {
  const res = await api.get<ApiResponse<SearchResult>>(
    `/api/users/${encodeURIComponent(username)}/followers`,
    { params: { page, limit: 20 } }
  );
  return res.data.data;
}

export async function getFollowing(
  username: string,
  page: number
): Promise<SearchResult> {
  const res = await api.get<ApiResponse<SearchResult>>(
    `/api/users/${encodeURIComponent(username)}/following`,
    { params: { page, limit: 20 } }
  );
  return res.data.data;
}
