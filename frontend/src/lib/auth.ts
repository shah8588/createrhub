import api from "./api";
import { tokenStore } from "./token";

export async function creatorLogin(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  tokenStore.set(data.data.token);
  return data.data;
}

export async function creatorRegister(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const { data } = await api.post("/auth/register", payload);
  tokenStore.set(data.data.token);
  return data.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    tokenStore.clear();
  }
}

export async function getUser() {
  const { data } = await api.get("/creator/me");
  return data.data;
}

export function isAuthenticated(): boolean {
  return Boolean(tokenStore.get());
}
