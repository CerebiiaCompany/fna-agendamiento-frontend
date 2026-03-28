"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

type AllowedRole = "ADMIN" | "ADVISOR" | "SUPERVISOR";

type ProtectedRouteProps = {
  children: React.ReactNode;
  role?: AllowedRole | AllowedRole[];
};

export function ProtectedRoute({ children, role: requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated, hydrate } = useAuthStore();
  const hydrateRef = useRef(hydrate);

  useEffect(() => {
    hydrateRef.current();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      const params = new URLSearchParams({ next: pathname ?? "/" });
      router.replace(`/login?${params.toString()}`);
      return;
    }

    const hasRole = requiredRole
      ? Array.isArray(requiredRole)
        ? requiredRole.includes(user.role as AllowedRole)
        : user.role === requiredRole
      : true;

    if (!hasRole) router.replace("/");
  }, [isHydrated, user, pathname, router, requiredRole]);

  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  const hasRole = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole.includes(user.role as AllowedRole)
      : user.role === requiredRole
    : true;

  if (!hasRole) return null;

  return <>{children}</>;
}