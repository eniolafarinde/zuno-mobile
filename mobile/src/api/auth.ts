import { api } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  onboardingComplete: boolean;
};

export async function register(email: string, password: string, name?: string) {
  const res = await api.post("/auth/register", { email, password, name });
  return res.data as { token: string; user: AuthUser };
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data as { token: string; user: AuthUser };
}

export async function getMe() {
  const res = await api.get("/me");
  return res.data.user ?? res.data;
}