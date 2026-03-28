import axios, { AxiosError } from "axios";

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("fna_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================
// TYPES
// =============================

export type UserRole = "ADMIN" | "ADVISOR";

export type AuthUser = {
  id: number;
  document_number: string;
  role: string;
  email: string | null;
};

export type LoginPayload = {
  document_number: string;
  password: string;
  role: UserRole;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export type RegisterPayload = {
  document_number: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
};

export type RegisterResponse = {
  user: AuthUser;
};

export type User = {
  id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string | null;
};

// =============================
// AUTH CALLS
// =============================

export async function login(
  payload: LoginPayload,
  signal?: AbortSignal
): Promise<LoginResponse> {
  const { data } = await authApi.post<LoginResponse>("/auth/login/", payload, { signal });
  return data;
}

export async function register(
  payload: RegisterPayload,
  signal?: AbortSignal
): Promise<RegisterResponse> {
  const { data } = await authApi.post<RegisterResponse>("/auth/register/", payload, { signal });
  return data;
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const { data } = await authApi.get<User[]>("/auth/users/", { signal });
  return data;
}

export async function deleteUser(userId: number): Promise<void> {
  await authApi.delete(`/auth/users/${userId}/`);
}

// =============================
// LOGOUT
// =============================

export function logout() {
  const refresh = localStorage.getItem("fna_refresh_token");

  if (refresh) {
    // Invalida el refresh token en el servidor (sin bloquear)
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
        { refresh },
        { headers: { "Content-Type": "application/json" } }
      )
      .catch(() => {});
  }

  localStorage.removeItem("fna_access_token");
  localStorage.removeItem("fna_refresh_token");
  localStorage.removeItem("fna_user");
  document.cookie = "fna_access_token=; path=/; max-age=0";

  window.location.href = "/login";
}

// =============================
// ERROR HELPER
// =============================

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string }>;
    const msg = err.response?.data?.detail ?? err.message;
    return typeof msg === "string" ? msg : "Error de conexión.";
  }
  return "Error inesperado.";
}

export default authApi;