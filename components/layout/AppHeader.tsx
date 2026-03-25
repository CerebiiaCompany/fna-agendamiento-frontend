"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleUser, LogOut, Mail, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { usePathname } from "next/navigation";
import type { AuthUser } from "../../lib/auth-api";

function roleLabel(role: string | undefined) {
  if (role === "ADMIN") return "Administrador";
  if (role === "ADVISOR") return "Asesor";
  return role ?? "";
}

function UserMenuDropdown({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id="user-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className={`group/avatar flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-50 hover:text-gray-900 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          open ? "ring-2 ring-blue-500/20 border-blue-200" : ""
        }`}
      >
        <span className="sr-only">Abrir menú de cuenta</span>
        <CircleUser
          className="h-[22px] w-[22px] transition-transform duration-200 ease-out group-hover/avatar:scale-110"
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id="user-menu-panel"
          role="menu"
          aria-labelledby="user-menu-trigger"
          data-open
          data-side="bottom"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-120 w-[min(calc(100vw-2rem),17.5rem)] origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-md shadow-gray-200/50 ring-1 ring-black/3 duration-200 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:translate-y-1 motion-reduce:data-open:animate-none motion-reduce:data-open:translate-y-0"
        >
          <div className="border-b border-gray-100 bg-linear-to-b from-white to-gray-50/80 px-4 pb-3 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Sesión
            </p>
            <p className="mt-1.5 truncate text-sm font-semibold tabular-nums text-gray-900">
              {user.document_number}
            </p>
            {user.role && (
              <p className="mt-0.5 text-xs text-gray-500">{roleLabel(user.role)}</p>
            )}
            {user.email && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" strokeWidth={1.75} />
                <span className="break-all">{user.email}</span>
              </p>
            )}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="group/logout flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-all duration-200 ease-out hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
            >
              <LogOut
                className="h-4 w-4 text-gray-400 transition-colors duration-200 ease-out group-hover/logout:text-red-500"
                strokeWidth={1.75}
              />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const ALL_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scheduling", label: "Agendar citas" },
  { href: "/reschedule", label: "Reagendar citas" },
  { href: "/register", label: "Registrar usuarios", adminOnly: true },
  { href: "/audit", label: "Auditorías" },
];

export function AppHeader() {
  const { user, logout, hydrate, isHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname()

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const navLinks = isHydrated && user
    ? ALL_NAV_LINKS.filter((link) => !link.adminOnly || user.role === "ADMIN")
    : [];

  return (
      <header className="sticky top-0 z-50 w-full bg-linear-to-b from-blue-50 to-transparent py-6 backdrop-blur">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="grid grid-cols-3 items-center w-full">

            <Link href="/" className="flex items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-blue-500/20">
                <Image
                  src="/logoHappy.jpeg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
         
            </Link>

            {isHydrated && user && (
              <div className="hidden navbar:flex items-center justify-center">
                <div className="flex items-center bg-white rounded-full border border-gray-200 p-1 shadow-sm gap-0.5">

                  {navLinks.map((link) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className={`px-3 py-1.5 text-md font-medium rounded-full transition-all whitespace-nowrap ${
                        pathname === link.href
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                </div>
              </div>
            )}

            {isHydrated && user && (
              <div className="hidden navbar:flex z-10 justify-end">
                <UserMenuDropdown user={user} onLogout={() => logout()} />
              </div>
            )}

            {isHydrated && user && (
              <div className="navbar:hidden col-start-3 flex items-center justify-end gap-2">
                <UserMenuDropdown
                  user={user}
                  onLogout={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                />
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white shadow-sm"
                  aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
                >
                  <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : ""}`} />
                  <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`navbar:hidden fixed inset-0 w-full h-screen z-[100] flex flex-col bg-white transition-all duration-300 ${
            mobileOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-6 pointer-events-none"
          }`}
        >
           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              FNA - Agendamiento
            </h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

          </div>
            <div className="flex flex-col flex-1 px-6 py-8">

              <div className="flex-1 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-5 py-4 rounded-2xl text-lg font-medium ${
                      pathname === link.href
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      transitionProperty: "all",
                      transitionDuration: "300ms",
                      transitionTimingFunction: "ease-out",
                      transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                      opacity: mobileOpen ? 1 : 0,
                      transform: mobileOpen
                        ? "translateX(0)"
                        : "translateX(-20px)",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  transitionDelay: mobileOpen ? "200ms" : "0ms",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
                }}
              >

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full h-14 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-base font-medium shadow-lg shadow-blue-500/25"
                >
                  Cerrar sesión
                </button>
              </div>

            </div>
          </div>
      </header>
  );
}
