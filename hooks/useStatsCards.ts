import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { useDashboardFilters } from "@/components/dashboard/DashboardFiltersProvider"

function calcPctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

export function useStatsCards() {
  const { auditorias, loading, error } = useAuditorias()
  const { range, sede } = useDashboardFilters()

  const stats = useMemo(() => {
    const filtered = auditorias.filter((r) => {
      const fecha = new Date(r.fechaAccion)
      const inRange = fecha >= range.from && fecha <= range.to
      const inSede = sede === "" || r.sede === sede
      return inRange && inSede
    })

    const duracion = range.to.getTime() - range.from.getTime()
    const prevStart = new Date(range.from.getTime() - duracion)
    const prevEnd = new Date(range.from)

    const previous = auditorias.filter((r) => {
      const fecha = new Date(r.fechaAccion)
      const inRange = fecha >= prevStart && fecha < prevEnd
      const inSede = sede === "" || r.sede === sede
      return inRange && inSede
    })

    const count = (records: typeof auditorias, accion: string) =>
      records.filter((r) => r.accion === accion).length

    const asesoresUnicos = (records: typeof auditorias) =>
      new Set(records.map((r) => r.asesor).filter(Boolean)).size

    const creadas_now     = count(filtered,  "Crear")
    const creadas_prev    = count(previous,  "Crear")
    const canceladas_now  = count(filtered,  "Eliminar")
    const canceladas_prev = count(previous,  "Eliminar")
    const reagendadas_now  = count(filtered,  "Reagendar")
    const reagendadas_prev = count(previous,  "Reagendar")
    const asesores_now    = asesoresUnicos(filtered)
    const asesores_prev   = asesoresUnicos(previous)

    return {
      citasCreadas:      creadas_now,
      citasCanceladas:   canceladas_now,
      citasReagendadas:  reagendadas_now,
      asesores:          asesores_now,
      cambioCreadas:     calcPctChange(creadas_now,    creadas_prev),
      cambioCanceladas:  calcPctChange(canceladas_now,  canceladas_prev),
      cambioReagendadas: calcPctChange(reagendadas_now, reagendadas_prev),
      cambioAsesores:    calcPctChange(asesores_now,    asesores_prev),
    }
  }, [auditorias, range, sede])

  return { stats, loading, error }
}