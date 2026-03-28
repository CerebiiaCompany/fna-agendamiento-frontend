"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDashboardFilters, Periodo } from "./DashboardFiltersProvider"
import { useAuditorias } from "@/hooks/useAuditorias"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "hoy",          label: "Hoy" },
  { value: "semana",       label: "Esta semana" },
  { value: "mes",          label: "Este mes" },
  { value: "trimestre",    label: "Este trimestre" },
  { value: "ano",          label: "Este año" },
  { value: "personalizado",label: "Personalizado" },
]

export function DashboardFiltersBar() {
  const { periodo, setPeriodo, setCustomRange, sede, setSede } = useDashboardFilters()
  const { auditorias } = useAuditorias()
  const [calOpen, setCalOpen] = useState(false)
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({})

  // Sedes únicas derivadas de las auditorías
  const sedes = Array.from(new Set(auditorias.map((a) => a.sede).filter(Boolean))) as string[]

  function handlePeriodoChange(value: Periodo) {
    setPeriodo(value)
    if (value !== "personalizado") setCalOpen(false)
    else setCalOpen(true)
  }

  function handleRangeSelect(range?: { from?: Date; to?: Date }) {
    if (!range) return
    setTempRange(range)
    if (range.from && range.to) {
      setCustomRange({ from: range.from, to: range.to })
      setCalOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">

      <Select value={periodo} onValueChange={handlePeriodoChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODOS.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>


      {periodo === "personalizado" && (
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-normal">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {tempRange.from && tempRange.to
                ? `${format(tempRange.from, "d MMM", { locale: es })} – ${format(tempRange.to, "d MMM yyyy", { locale: es })}`
                : "Seleccionar rango"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={tempRange as { from: Date; to: Date }}
              onSelect={handleRangeSelect}
              locale={es}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      )}

      {sedes.length > 0 && (
        <Select
        value={sede === "" ? "todas" : sede}
        onValueChange={(v) => setSede(v === "todas" ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Todas las sedes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las sedes</SelectItem>
            {sedes.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}