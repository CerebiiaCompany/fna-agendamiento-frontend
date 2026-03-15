"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** Si se indica, solo usuarios con este rol pueden ver la ruta. Si no, se redirige a /. */
  role?: "ADMIN";
};

export function ProtectedRoute({ children, role: requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      const params = new URLSearchParams({ next: pathname ?? "/" });
      router.replace(`/login?${params.toString()}`);
      return;
    }
    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isHydrated, user, pathname, router, requiredRole]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
