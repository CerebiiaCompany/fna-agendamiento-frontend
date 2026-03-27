import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { prepararDatosServicios } from "@/utils/stats"

export function useServicesChart(dias = 7, top = 5) {
  const { auditorias, loading } = useAuditorias()

  const data = useMemo(
    () => prepararDatosServicios(auditorias, dias, top),
    [auditorias, dias, top]
  )

  return { data, loading }
}