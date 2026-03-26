"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, User, Calendar, MapPin, Briefcase, Clock, IdCard, Repeat, FileStack } from "lucide-react"
import { obtenerAuditorias, AuditRecord } from "@/lib/api"

const accionStyles = {
  Reagendar: "bg-amber-50 text-amber-700 border-amber-200",
  Crear: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Eliminar: "bg-red-50 text-red-700 border-red-200",
} as const

const accionLabels = {
  Reagendar: "Reagendar",
  Crear: "Creación",
  Eliminar: "Eliminación",
} as const

export function AppointmentsTable() {
  const [auditorias, setAuditorias] = useState<AuditRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSede, setFilterSede] = useState<string>("all")
  const [filterAccion, setFilterAccion] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerAuditorias()
        setAuditorias(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const filteredData = auditorias.filter(record => {
    const matchesSearch =
      record.asesor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sede.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSede = filterSede === "all" || record.sede.includes(filterSede)
    const matchesAccion = filterAccion === "all" || record.accion === filterAccion

    return matchesSearch && matchesSede && matchesAccion
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage > 3) {
        pages.push("...")
    }

    for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
    ) {
        pages.push(i)
    }

    if (currentPage < totalPages - 2) {
        pages.push("...")
    }

    pages.push(totalPages)

    return pages
    }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { date: "-", time: null }

    const [datePart, timePart] = dateStr.includes("T") 
        ? dateStr.split("T") 
        : [dateStr.slice(0, 10), dateStr.slice(10)]

    let time: string | null = null
    if (timePart) {
        const [hour, minute] = timePart.split(":")
        time = `${hour}:${minute}`
    }

    return { date: datePart, time }
    }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, servicio o sede..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={filterSede} onValueChange={(v) => { setFilterSede(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px] sm:w-[180px] bg-card">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Filtrar por sede" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sedes</SelectItem>
              {Array.from(new Set(auditorias.map((a) => a.sede)))
                .filter((sede) => sede)
                .map((sede) => (
                  <SelectItem key={sede} value={sede}>{sede}</SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={filterAccion} onValueChange={(v) => { setFilterAccion(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px] sm:w-[160px] bg-card">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Tipo de acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              {Object.keys(accionLabels).map((key) => (
                <SelectItem key={key} value={key}>
                  {accionLabels[key as keyof typeof accionLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {paginatedData.length > 0 ? (
            paginatedData.map((record) => (
            <div
                key={record.id}
                className="p-4 border rounded-xl bg-card shadow-sm space-y-3"
            >
                <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Asesor</p>
                    <p className="font-semibold">{record.asesor}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium">{record.usuario}</p>
                    <p className="text-xs text-muted-foreground">
                    ID: {record.identificacion}
                    </p>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Servicio</p>
                    <p className="font-medium">{record.servicio}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Sede</p>
                    <p className="font-medium">{record.sede}</p>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Cita</p>
                    <p className="font-medium">
                    {formatDate(record.fechaCita).date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    {formatDate(record.fechaCita).time}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Acción</p>
                    <p className="font-medium">
                    {formatDate(record.fechaAccion).date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    {formatDate(record.fechaAccion).time}
                    </p>
                </div>
                </div>

                <div className="pt-2">
                <Badge className={`${accionStyles[record.accion]} font-medium w-full justify-center`}>
                    {accionLabels[record.accion]}
                </Badge>
                </div>
            </div>
            ))
        ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
            No se encontraron registros
            </div>
        )}
        </div>

      <div className="hidden md:block rounded-2xl border bg-card max-h-[600px] min-h-[470px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground whitespace-nowrap p-2">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground text-slate-400"  /> Asesor
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                <span className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" /> Acción
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Usuario
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap hidden lg:table-cell">
                <span className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" /> No. Identificación
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap">
                <span className="flex items-center gap-2">
                    <FileStack className="h-4 w-4 text-muted-foreground" /> Servicio
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap hidden lg:table-cell">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Sede
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Fecha Cita
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap hidden lg:table-cell">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Fecha Acción
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => {
                const fechaCita = formatDate(record.fechaCita)
                const fechaAccion = formatDate(record.fechaAccion)
                return (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium !text-[#0051ff]">
                            {record.asesor.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </span>
                        </div>
                        <span className="font-medium">{record.asesor}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-left">
                      <Badge
                        variant="outline"
                        className={`${accionStyles[record.accion]} font-medium whitespace-nowrap`}
                      >
                        {accionLabels[record.accion]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-foreground whitespace-nowrap">{record.usuario}</p>
                        <p className="text-xs font-mono text-muted-foreground lg:hidden">
                          {record.identificacion}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono text-sm text-foreground">{record.identificacion}</span>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{record.servicio}</TableCell>

                    <TableCell className="text-muted-foreground hidden lg:table-cell">{record.sede}</TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground whitespace-nowrap">{fechaCita.date}</span>
                        <span className="text-xs text-muted-foreground">{fechaCita.time}</span>
                        <p className="text-xs text-muted-foreground lg:hidden mt-0.5">
                          Acc: {fechaAccion.date} {fechaAccion.time}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-foreground whitespace-nowrap">{fechaAccion.date}</span>
                        {fechaAccion.time && (
                          <span className="text-xs text-muted-foreground">{fechaAccion.time}</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
            </p>
            <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="border-border bg-secondary text-foreground hover:bg-muted disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
                Anterior
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                page === "..." ? (
                    <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                    >
                    ...
                    </span>
                ) : (
                    <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                        currentPage === page
                        ? "size-8 bg-blue-500 text-white hover:bg-blue-600"
                        : "size-8 border-border bg-secondary text-foreground hover:bg-muted"
                    }
                    onClick={() => setCurrentPage(page as number)}
                    >
                    {page}
                    </Button>
                )
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                className="border-border bg-secondary text-foreground hover:bg-muted disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
            >
                Siguiente
            </Button>
            </div>
        </div>
        )}
    </div>
  )
}