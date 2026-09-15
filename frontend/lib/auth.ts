import { apiFetch, setToken } from "@/lib/api";
import type { AuthTokenResponse, User } from "@/lib/types";

export async function register(email: string, password: string, fullName?: string) {
  const res = await apiFetch<AuthTokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName || null }),
  });
  setToken(res.access_token);
  return res;
}

export async function login(email: string, password: string) {
  const res = await apiFetch<AuthTokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.access_token);
  return res;
}

export async function fetchMe() {
  return apiFetch<User>("/api/v1/auth/me");
}
