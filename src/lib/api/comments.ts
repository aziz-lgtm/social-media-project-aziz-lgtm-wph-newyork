import { api } from "@/lib/api/axios";
import type { ApiResponse, Comment, CommentsResult } from "@/lib/types";

export async function getComments(
  postId: number,
  page: number
): Promise<CommentsResult> {
  const res = await api.get<ApiResponse<CommentsResult>>(
    `/api/posts/${postId}/comments`,
    { params: { page, limit: 10 } }
  );
  return res.data.data;
}

export async function addComment(
  postId: number,
  text: string
): Promise<Comment> {
  const res = await api.post<ApiResponse<Comment>>(
    `/api/posts/${postId}/comments`,
    { text }
  );
  return res.data.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/api/comments/${commentId}`);
}
