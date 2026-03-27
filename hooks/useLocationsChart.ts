import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { prepararDatosSedes } from "@/utils/stats"

export function useLocationsChart(dias = 7) {
  const { auditorias, loading } = useAuditorias()

  const data = useMemo(
    () => prepararDatosSedes(auditorias, dias),
    [auditorias, dias]
  )

  return { data, loading }
}