import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/lib/types";

export async function followUser(username: string) {
  const res = await api.post<ApiResponse<{ following: boolean }>>(
    `/api/follow/${encodeURIComponent(username)}`
  );
  return res.data.data;
}

export async function unfollowUser(username: string) {
  const res = await api.delete<ApiResponse<{ following: boolean }>>(
    `/api/follow/${encodeURIComponent(username)}`
  );
  return res.data.data;
}
