import { api } from "@/lib/api/axios";
import type { ApiResponse, MeResult } from "@/lib/types";

export async function getMe(): Promise<MeResult> {
  const res = await api.get<ApiResponse<MeResult>>("/api/me");
  return res.data.data;
}
