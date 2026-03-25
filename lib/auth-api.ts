import axios, { AxiosError } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

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
  first_name: string,
  last_name: string;
};

export type RegisterResponse = {
  user: AuthUser;
};

export async function login(
  payload: LoginPayload,
  signal?: AbortSignal
): Promise<LoginResponse> {
  const { data } = await authApi.post<LoginResponse>(
    "/auth/login/",
    payload,
    { signal }
  );
  return data;
}

export async function register(
  payload: RegisterPayload,
  signal?: AbortSignal
): Promise<RegisterResponse> {
  const { data } = await authApi.post<RegisterResponse>(
    "/auth/register/",
    payload,
    { signal }
  );
  return data;
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string }>;
    const msg = err.response?.data?.detail ?? err.message;
    return typeof msg === "string" ? msg : "Error de conexión.";
  }
  return "Error inesperado.";
}
