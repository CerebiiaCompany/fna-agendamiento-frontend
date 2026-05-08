"use client"
import { createContext, useContext, useState, useMemo } from "react"
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter,
  startOfYear, endOfYear, subDays,
} from "date-fns"

export type Periodo = "hoy" | "semana" | "mes" | "mes_anio" | "trimestre" | "ano" | "personalizado"
export interface DateRange { from: Date; to: Date }

interface FiltersCtx {
  periodo: Periodo
  setPeriodo: (p: Periodo) => void
  selectedMonth: number
  setSelectedMonth: (m: number) => void
  selectedYear: number
  setSelectedYear: (y: number) => void
  range: DateRange
  setCustomRange: (r: DateRange) => void
  sede: string
  setSede: (s: string) => void
  dias: number
}

const DashboardFiltersCtx = createContext<FiltersCtx | null>(null)

function resolveRange(
  periodo: Periodo,
  custom: DateRange,
  selectedMonth: number,
  selectedYear: number
): DateRange {
  const now = new Date()
  switch (periodo) {
    case "hoy":           return { from: startOfDay(now), to: endOfDay(now) }
    case "semana":        return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case "mes":           return { from: startOfMonth(now), to: endOfMonth(now) }
    case "mes_anio": {
      const base = new Date(selectedYear, selectedMonth, 1)
      return { from: startOfMonth(base), to: endOfMonth(base) }
    }
    case "trimestre":     return { from: startOfQuarter(now), to: endOfQuarter(now) }
    case "ano":           return { from: startOfYear(now), to: endOfYear(now) }
    case "personalizado": return { from: startOfDay(custom.from), to: endOfDay(custom.to) }
  }
}

function rangeToDias(range: DateRange) {
  return Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / 86_400_000))
}

export function DashboardFiltersProvider({ children }: { children: React.ReactNode }) {
  const [periodo, setPeriodo] = useState<Periodo>("semana")
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [customRange, setCustomRange] = useState<DateRange>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })
  const [sede, setSede] = useState("")

  const range = useMemo(
    () => resolveRange(periodo, customRange, selectedMonth, selectedYear),
    [periodo, customRange, selectedMonth, selectedYear]
  )
  const dias  = useMemo(() => rangeToDias(range), [range])

  return (
    <DashboardFiltersCtx.Provider
      value={{
        periodo,
        setPeriodo,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        range,
        setCustomRange,
        sede,
        setSede,
        dias,
      }}
    >
      {children}
    </DashboardFiltersCtx.Provider>
  )
}

// Hook y tipos exportados desde el mismo archivo
export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersCtx)
  if (!ctx) throw new Error("useDashboardFilters must be inside DashboardFiltersProvider")
  return ctx
}