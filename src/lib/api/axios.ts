import axios, { AxiosError } from "axios";
import { getToken } from "@/lib/token";
import type { ApiResponse } from "@/lib/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extract the API's error message from an axios error, with a readable fallback. */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body?.message) return body.message;
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the server. Check your connection and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
