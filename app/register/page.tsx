"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { UsersTable } from "@/components/users/UsersTable"

export default function UsersPage() {
    return (
        <ProtectedRoute role="ADMIN">
        <div className="min-h-[calc(100vh-80px)] bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 px-4 py-10 font-sans">
            <main className="container mx-auto px-4 py-10">
                <div className="mb-6">
                <h2 className="text-4xl font-semibold text-foreground text-balance">Gestión de usuarios</h2>
                <p className="text-muted-foreground mt-1">
                    Consulta y administra los usuarios registrados en el sistema.
                </p>
                </div>
                <UsersTable />
            </main>
            </div>
        </ProtectedRoute>
    )
}
