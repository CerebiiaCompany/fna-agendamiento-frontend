import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { useDashboardFilters } from "@/components/dashboard/DashboardFiltersProvider"
import { prepararDatosAsesores } from "@/utils/stats"

export function useAdvisorsTable() {
  const { auditorias, loading } = useAuditorias()
  const { range, sede, dias } = useDashboardFilters()

  const data = useMemo(() => {
    const filtered = auditorias.filter((r) => {
      const fecha = new Date(r.fechaAccion)
      return fecha >= range.from && fecha <= range.to && (sede === "" || r.sede === sede)
    })
    return prepararDatosAsesores(filtered, dias)
  }, [auditorias, range, sede, dias])

  return { data, loading }
}