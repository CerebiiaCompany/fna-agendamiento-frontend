"use client"

import { useCallback, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppointmentsChart } from "@/components/dashboard/AppointmentsChart"
import { ServicesChart } from "@/components/dashboard/ServicesChart"
import { StatsCards } from "@/components/dashboard/StatsCard"
import { OfficesChart } from "@/components/dashboard/OfficesChart"
import { AdvisorsTable } from "@/components/dashboard/AdvisorsTable"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuditorias } from "@/hooks/useAuditorias"

export default function DashboardPage() {
  const { refetch } = useAuditorias()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [refetch])

  return (
    <ProtectedRoute role="ADMIN">
      <div className="min-h-[calc(100vh-80px)] bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 px-4 py-10 font-sans">
        <main className="container mx-auto px-4 py-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-semibold text-foreground text-balance">
                Dashboard
              </h2>
              <p className="text-muted-foreground mt-1">
                Métricas y actividad registrada en el sistema
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          <div className="space-y-6">
            {/* Stats cards */}
            <StatsCards />

            {/* Gráficos principales */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AppointmentsChart />
              </div>
              <ServicesChart />
            </div>

            {/* Sedes + Asesores */}
            <div className="grid gap-6 lg:grid-cols-3">
              <OfficesChart />
              <div className="lg:col-span-2">
                <AdvisorsTable />
              </div>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  )
}