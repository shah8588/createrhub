import axios, { type AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Refresh CSRF token on 419 and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419) {
      await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export function getFieldErrors(
  error: unknown
): Record<string, string[]> | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.errors;
  }
  return undefined;
}
