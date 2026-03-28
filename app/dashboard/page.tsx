"use client"
import { useCallback, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppointmentsChart } from "@/components/dashboard/AppointmentsChart"
import { ServicesChart } from "@/components/dashboard/ServicesChart"
import { StatsCards } from "@/components/dashboard/StatsCard"
import { OfficesChart } from "@/components/dashboard/OfficesChart"
import { AdvisorsTable } from "@/components/dashboard/AdvisorsTable"
import { DashboardFiltersBar } from "@/components/dashboard/DashboardFilters"
import { DashboardFiltersProvider } from "@/components/dashboard/DashboardFiltersProvider"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuditorias } from "@/hooks/useAuditorias"

function DashboardContent() {
  const { refetch } = useAuditorias()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [refetch])

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 font-sans">
      <main className="container mx-auto px-4 py-6 sm:py-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-foreground text-balance">
              Dashboard
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Métricas y actividad registrada en el sistema
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 self-start"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Barra de filtros global */}
        <div className="mb-4 sm:mb-6">
          <DashboardFiltersBar />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <StatsCards />

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AppointmentsChart />
            </div>
            <ServicesChart />
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            <OfficesChart />
            <div className="lg:col-span-2">
              <AdvisorsTable />
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <DashboardFiltersProvider>
        <DashboardContent />
      </DashboardFiltersProvider>
    </ProtectedRoute>
  )
}