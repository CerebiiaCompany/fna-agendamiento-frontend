import { AuditRecord } from "@/lib/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface AppointmentData {
  fecha: string
  creadas: number
  canceladas: number
  reagendadas: number
}

export interface ServiceData {
  servicio: string
  cantidad: number
}

export interface LocationData {
  sede: string
  cantidad: number
}

export interface AdvisorData {
  id: string
  nombre: string
  citas: number
  creadas: number
  reagendadas: number
  canceladas: number
  sede: string
}


export function prepararDatosGrafica(
  auditorias: AuditRecord[],
  dias: number = 7
): AppointmentData[] {
  const now = new Date()

  const buckets: Record<string, AppointmentData> = {}

  for (let i = -(dias - 1); i <= 0; i++) {
    const dia = new Date(now)
    dia.setDate(now.getDate() + i)
    const key = format(dia, "yyyy-MM-dd")
    buckets[key] = {
      fecha: format(dia, "d MMM", { locale: es }),
      creadas: 0,
      canceladas: 0,
      reagendadas: 0,
    }
  }

  for (const record of auditorias) {
    const key = format(new Date(record.fechaAccion), "yyyy-MM-dd")
    if (!buckets[key]) continue

    if (record.accion === "Crear")          buckets[key].creadas++
    else if (record.accion === "Eliminar")  buckets[key].canceladas++
    else if (record.accion === "Reagendar") buckets[key].reagendadas++
  }

  return Object.values(buckets)
}


export function prepararDatosServicios(
  auditorias: AuditRecord[],
  dias: number = 7,
  top: number = 5
): ServiceData[] {
  const now = new Date()
  const inicio = new Date(now)
  inicio.setDate(now.getDate() - (dias - 1))
  inicio.setHours(0, 0, 0, 0)

  const conteo: Record<string, number> = {}

  for (const record of auditorias) {
    const fecha = new Date(record.fechaAccion)
    if (fecha < inicio) continue
    if (!record.servicio) continue

    conteo[record.servicio] = (conteo[record.servicio] ?? 0) + 1
  }

  return Object.entries(conteo)
    .map(([servicio, cantidad]) => ({ servicio, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, top)
}


export function prepararDatosSedes(
  auditorias: AuditRecord[],
  dias: number = 7
): LocationData[] {
  const now = new Date()
  const inicio = new Date(now)
  inicio.setDate(now.getDate() - (dias - 1))
  inicio.setHours(0, 0, 0, 0)

  const conteo: Record<string, number> = {}

  for (const record of auditorias) {
    const fecha = new Date(record.fechaAccion)
    if (fecha < inicio) continue
    if (!record.sede) continue

    conteo[record.sede] = (conteo[record.sede] ?? 0) + 1
  }

  return Object.entries(conteo)
    .map(([sede, cantidad]) => ({ sede, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

export function prepararDatosAsesores(
  auditorias: AuditRecord[],
  dias: number = 7
): AdvisorData[] {
  const now = new Date()
  const inicio = new Date(now)
  inicio.setDate(now.getDate() - (dias - 1))
  inicio.setHours(0, 0, 0, 0)

  const mapa: Record<string, AdvisorData> = {}

  for (const record of auditorias) {
    const fecha = new Date(record.fechaAccion)
    if (fecha < inicio) continue
    if (!record.asesor) continue

    if (!mapa[record.asesor]) {
      mapa[record.asesor] = {
        id: record.asesor,
        nombre: record.asesor,
        citas: 0,
        creadas: 0,
        reagendadas: 0,
        canceladas: 0,
        sede: record.sede ?? "",
      }
    }

    mapa[record.asesor].citas++

    if (record.accion === "Crear")          mapa[record.asesor].creadas++
    else if (record.accion === "Reagendar") mapa[record.asesor].reagendadas++
    else if (record.accion === "Eliminar")  mapa[record.asesor].canceladas++
  }

  return Object.values(mapa).sort((a, b) => b.citas - a.citas)
}