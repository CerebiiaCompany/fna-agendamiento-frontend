import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { prepararDatosGrafica } from "@/utils/stats"

export function useAppointmentsChart(dias = 7) {
  const { auditorias, loading, error } = useAuditorias()

  const data = useMemo(
    () => prepararDatosGrafica(auditorias, dias),
    [auditorias, dias]
  )

  return { data, loading, error }
}