"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { usePathname } from "next/navigation"
import Image from "next/image"

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const ALL_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scheduling", label: "Agendar citas" },
  { href: "/reschedule", label: "Reagendar citas" },
  { href: "/cancelar", label: "Cancelar citas" },
  { href: "/register", label: "Registrar usuarios", adminOnly: true },
  { href: "/auditorias", label: "Auditorías" },
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
      <header className="sticky top-0 z-50 w-full bg-linear-to-b from-blue-50 to-transparent backdrop-blur py-4">
        <div className="mx-auto px-6">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-blue-500/20">
                  <Image
                    src="/logoHappy.jpeg"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  FNA Agendamiento
                </span>
              </Link>
            </div>

            {isHydrated && user && (
              <div className="w-full flex justify-center">
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 px-3 py-3 shadow-sm">
                  
                  {navLinks.map((link, i) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className={`flex-1 text-center my-1 px-2 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out whitespace-nowrap ${
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

            {/* RIGHT - USER */}
            {isHydrated && user && (
              <div className="justify-self-end hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  {user.document_number}
                  {user.role && (
                    <span className="ml-1 text-gray-500">({user.role})</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25"
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            {/* MOBILE BUTTON */}
            {isHydrated && user && (
              <div className="justify-self-end md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU (igual que el tuyo) */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed right-0 top-0 z-50 h-full w-[300px] border-l border-gray-200 bg-white shadow-xl md:hidden">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <span className="text-lg font-semibold text-gray-900">
                  Menú
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <p className="px-3 text-xs text-gray-400">
                    {user?.document_number} ({user?.role})
                  </p>

                  <button
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
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
