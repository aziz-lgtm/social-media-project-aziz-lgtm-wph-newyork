import { api } from "@/lib/api/axios";
import type { ApiResponse, AuthResult } from "@/lib/types";

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthResult>>(
    "/api/auth/register",
    payload
  );
  return res.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthResult>>(
    "/api/auth/login",
    payload
  );
  return res.data.data;
}
