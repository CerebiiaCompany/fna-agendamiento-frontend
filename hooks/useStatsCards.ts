import { useMemo, useEffect, useState } from "react"
import { obtenerAuditorias, AuditRecord } from "@/lib/api"

function calcPctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

function filtrarPorPeriodo(records: AuditRecord[], start: Date, end: Date) {
  return records.filter((r) => {
    const fecha = new Date(r.fechaAccion)
    return fecha >= start && fecha < end
  })
}

export function useStatsCards() {
  const [auditorias, setAuditorias] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obtenerAuditorias(controller.signal)
      .then((data) => {
        console.log("DATOS:", data)
        setAuditorias(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err)
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const current = filtrarPorPeriodo(auditorias, currentStart, now)
    const previous = filtrarPorPeriodo(auditorias, previousStart, currentStart)

    const count = (records: AuditRecord[], accion: string) =>
      records.filter((r) => r.accion === accion).length

    const asesores = (records: AuditRecord[]) =>
      new Set(records.map((r) => r.asesor).filter(Boolean)).size

    const creadas_now = count(current, "Crear")
    const creadas_prev = count(previous, "Crear")

    const canceladas_now = count(current, "Eliminar")
    const canceladas_prev = count(previous, "Eliminar")

    const reagendadas_now = count(current, "Reagendar")
    const reagendadas_prev = count(previous, "Reagendar")

    const asesores_now = asesores(current)
    const asesores_prev = asesores(previous)

    return {
      citasCreadas: creadas_now,
      citasCanceladas: canceladas_now,
      citasReagendadas: reagendadas_now,
      asesores: asesores_now,
      cambioCreadas: calcPctChange(creadas_now, creadas_prev),
      cambioCanceladas: calcPctChange(canceladas_now, canceladas_prev),
      cambioReagendadas: calcPctChange(reagendadas_now, reagendadas_prev),
      cambioAsesores: calcPctChange(asesores_now, asesores_prev),
    }
  }, [auditorias])

  return { stats, loading, error }
}