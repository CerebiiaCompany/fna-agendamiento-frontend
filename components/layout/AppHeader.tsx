"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
              <span className="text-xl font-bold text-gray-900">
                FNA Agendamiento
              </span>
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
              <div className="hidden navbar:flex items-center gap-3 z-10 justify-end">
                <span className="text-sm text-gray-700">
                  {user.document_number}
                  {user.role && (
                    <span className="ml-1 text-gray-500">({user.role})</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="bg-blue-600 text-white hover:bg-blue-500 rounded-full px-4 py-2 text-sm font-medium shadow-lg shadow-blue-500/25"
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            {isHydrated && user && (
              <div className="navbar:hidden flex justify-end col-start-3">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full bg-white border border-gray-200 shadow-sm z-10"
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

        {mobileOpen && (
          <div
            className={`navbar:hidden <div className="fixed inset-0 z-[100] flex items-center justify-center ${
              mobileOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
            style={{ backgroundColor: 'white' }}
          >
            <div className="h-full flex flex-col px-6 py-8">

              <div className="flex-1 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-5 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
                      pathname === link.href
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
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
                className="pt-6 border-t border-gray-100 space-y-3"
                style={{
                  transitionDelay: mobileOpen ? "200ms" : "0ms",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.3s ease-out",
                }}
              >
                <p className="text-sm text-gray-500">
                  {user?.document_number} ({user?.role})
                </p>

                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="w-full h-14 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-base font-medium shadow-lg shadow-blue-500/25"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
  );
}
