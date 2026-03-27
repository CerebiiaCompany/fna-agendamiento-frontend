"use client"

import { useEffect, useState, useCallback } from "react"
import { obtenerAuditorias, AuditRecord } from "@/lib/api"

interface UseAuditoriasReturn {
  auditorias: AuditRecord[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useAuditorias(): UseAuditoriasReturn {
  const [auditorias, setAuditorias] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    obtenerAuditorias(controller.signal)
      .then((data: AuditRecord[]) => {
        setAuditorias(data)
        setLoading(false)
        setError(null)
        })

      .catch((err: Error) => {
            if (err.name !== "AbortError") {
            setError(err)
            setLoading(false)
            }
        })

    return () => controller.abort()
  }, [trigger])

  const refetch = useCallback(() => setTrigger((t) => t + 1), [])

  return { auditorias, loading, error, refetch }
}