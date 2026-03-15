"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const ALL_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard" },
  { href: "/", label: "Agendar citas" },
  { href: "/reagendar", label: "Reagendar citas" },
  { href: "/cancelar", label: "Cancelar citas" },
  { href: "/register", label: "Registrar usuarios", adminOnly: true },
  { href: "/auditorias", label: "Auditorías" },
];

export function AppHeader() {
  const { user, logout, hydrate, isHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const navLinks = isHydrated && user
    ? ALL_NAV_LINKS.filter((link) => !link.adminOnly || user.role === "ADMIN")
    : [];

  return (
      <header className="sticky top-0 z-50 w-full border-b border-blue-500 bg-blue-600/95 text-white backdrop-blur py-4">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-sky-600">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            FNA Agendamiento
          </span>
        </Link>

        {isHydrated && user && (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="text-sm font-medium text-white transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              <span className="text-xs text-white">
                {user.document_number}
                {user.role && (
                  <span className="ml-1 text-white">({user.role})</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-sky-700"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}

        {/* Mobile Menu Button */}
        {isHydrated && user && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
        )}
      </div>

      {/* Mobile Menu (Sheet-like panel) */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-[300px] border-l border-slate-200 bg-white shadow-xl md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-lg font-semibold text-slate-900">
                Menú
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <p className="px-3 text-xs text-slate-400">
                  {user?.document_number} ({user?.role})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
