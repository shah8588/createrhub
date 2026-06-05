import api from "./api";
import axios from "axios";

export async function getCsrfCookie() {
  await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
}

export async function creatorLogin(email: string, password: string) {
  await getCsrfCookie();
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function creatorRegister(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  await getCsrfCookie();
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getUser() {
  const { data } = await api.get("/creator/me");
  return data.data;
}
