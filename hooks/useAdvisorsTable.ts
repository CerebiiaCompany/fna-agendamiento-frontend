import { useMemo } from "react"
import { useAuditorias } from "@/hooks/useAuditorias"
import { prepararDatosAsesores } from "@/utils/stats"

export function useAdvisorsTable(dias = 7) {
  const { auditorias, loading } = useAuditorias()

  const data = useMemo(
    () => prepararDatosAsesores(auditorias, dias),
    [auditorias, dias]
  )

  return { data, loading }
}