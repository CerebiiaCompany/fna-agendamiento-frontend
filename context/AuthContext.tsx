"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { logout as apiLogout } from "@/lib/auth-api";

type User = {
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: lee localStorage una sola vez al montar, sin useEffect
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem("fna_access_token");
      const savedUser = localStorage.getItem("fna_user");
      if (token && savedUser) return JSON.parse(savedUser);
    } catch {
      // JSON inválido o localStorage no disponible (SSR)
    }
    return null;
  });

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("fna_access_token", accessToken);
    localStorage.setItem("fna_refresh_token", refreshToken);
    localStorage.setItem("fna_user", JSON.stringify(userData));
    document.cookie = `fna_access_token=${accessToken}; path=/; max-age=1800`;
    setUser(userData);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}