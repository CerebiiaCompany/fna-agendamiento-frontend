import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { useDashboardFilters } from "@/components/dashboard/DashboardFiltersProvider"
import { prepararDatosServicios } from "@/utils/stats"

export function useServicesChart(top = 5) {
  const { auditorias, loading } = useAuditorias()
  const { range, sede, dias } = useDashboardFilters()

  const data = useMemo(() => {
    const filtered = auditorias.filter((r) => {
      const fecha = new Date(r.fechaAccion)
      return fecha >= range.from && fecha <= range.to && (sede === "" || r.sede === sede)
    })
    return prepararDatosServicios(filtered, dias, top)
  }, [auditorias, range, sede, dias, top])

  return { data, loading }
}