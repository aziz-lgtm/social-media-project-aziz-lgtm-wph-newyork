import { api } from "@/lib/api/axios";
import type { ApiResponse, MeResult, Profile } from "@/lib/types";

export async function getMe(): Promise<MeResult> {
  const res = await api.get<ApiResponse<MeResult>>("/api/me");
  return res.data.data;
}

export interface UpdateMeInput {
  name: string;
  username: string;
  phone: string;
  bio: string;
  avatar?: File;
}

export async function updateMe(input: UpdateMeInput): Promise<Profile> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("username", input.username);
  form.append("bio", input.bio);
  // The API 500s on an empty/missing-"+" phone value (confirmed live) —
  // only send it when there's a real, already-validated value to submit.
  if (input.phone) form.append("phone", input.phone);
  if (input.avatar) form.append("avatar", input.avatar);
  const res = await api.patch<ApiResponse<Profile>>("/api/me", form);
  return res.data.data;
}
