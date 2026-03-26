"use client"

import { AppointmentsTable } from "@/components/audit/AuditTable"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function AuditPage() {
    return (
        <ProtectedRoute role="ADMIN">
        <div className="min-h-[calc(100vh-80px)] bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 px-4 py-10 font-sans">
            <main className="container mx-auto px-4 py-10">
                <div className="mb-6">
                <h2 className="text-4xl font-semibold text-foreground text-balance">Registro de Auditoría</h2>
                <p className="text-muted-foreground mt-1">
                    Historial de accesos y acciones realizadas en el sistema
                </p>
                </div>
                <AppointmentsTable />
            </main>
            </div>
        </ProtectedRoute>
    )
}