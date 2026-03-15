"use client";

import { create } from "zustand";
import type { AuthUser } from "../lib/auth-api";

const STORAGE_KEYS = {
  access: "fna_access_token",
  refresh: "fna_refresh_token",
  user: "fna_user",
} as const;

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function getStoredAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.access);
}

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, access: string, refresh: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setAuth: (user, access, refresh) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.access, access);
      localStorage.setItem(STORAGE_KEYS.refresh, refresh);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
    set({ user, accessToken: access });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.access);
      localStorage.removeItem(STORAGE_KEYS.refresh);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    set({ user: null, accessToken: null });
  },

  hydrate: () => {
    const user = getStoredUser();
    const access = getStoredAccess();
    set({ user, accessToken: access, isHydrated: true });
  },
}));
