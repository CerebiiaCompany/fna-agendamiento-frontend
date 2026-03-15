import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Respuestas del backend fna-agendamiento-backend

export type Ciudad = {
  id: number;
  departamentoId: string;
  nombre: string;
  listed: boolean;
};

export type Sede = {
  id: number;
  name: string;
  direction: string;
};

export type Subservice = {
  id: number;
  name: string;
};

export type Service = {
  id: number;
  name: string;
  subservices: Subservice[];
};

export type DisponibilidadDia = {
  date: string;
  hours: string[];
};

// Respuesta de POST /api/availability/offices/
export type ScheduleHour = { hour: string };
export type ScheduleItem = {
  date: string;
  weekDay: string;
  disabled: boolean;
  scheduleHours: ScheduleHour[];
};
export type OfficeAvailability = {
  officeId: number;
  descriptionOffice: string;
  schedules: ScheduleItem[];
};

export type CitaCreada = {
  appointmentId: number;
  status: string;
};

// Ciudades disponibles (GET /api/cities/)
export async function obtenerCiudades(
  signal?: AbortSignal
): Promise<Ciudad[]> {
  const { data } = await api.get<Ciudad[]>("/cities/", { signal });
  return data;
}

// Sedes por ciudad (POST /api/offices/) — body: { ciudad: cityId }
export async function obtenerSedesPorCiudad(
  ciudadId: number,
  signal?: AbortSignal
): Promise<Sede[]> {
  const { data } = await api.post<Sede[]>(
    "/offices/",
    { ciudad: ciudadId },
    { signal }
  );
  return data;
}

// Servicios con subservicios por sede (GET /api/services/<branchId>/)
export async function obtenerServiciosPorSede(
  branchId: number,
  signal?: AbortSignal
): Promise<Service[]> {
  const { data } = await api.get<Service[]>(`/services/${branchId}/`, {
    signal,
  });
  return data;
}

// Disponibilidad: sede + fecha → horas (POST /api/availability/)
// body: { branchOfficeId, datePetition, departmentId, cityId }
export async function obtenerDisponibilidad(
  params: {
    branchOfficeId: number;
    datePetition: string;
    departmentId: number;
    cityId: number;
  },
  signal?: AbortSignal
): Promise<DisponibilidadDia[]> {
  const { data } = await api.post<DisponibilidadDia[]>(
    "/availability/",
    params,
    { signal },
  );
  return data;
}

// Disponibilidad por oficinas: devuelve oficinas con schedules (días y scheduleHours)
// POST /api/availability/offices/ — body: { cityId, departmentId, startDate? }
export async function obtenerDisponibilidadPorOficinas(
  params: {
    cityId: number;
    departmentId: number;
    startDate?: string;
  },
  signal?: AbortSignal
): Promise<OfficeAvailability[]> {
  const { data } = await api.post<OfficeAvailability[]>(
    "/availability/offices/",
    params,
    { signal }
  );
  return data;
}

// Crear cita (POST /api/appointments/) — body como lo espera la API FNA /petition
export type CrearCitaPayload = {
  acepto: string;
  branchOfficeId: string;
  browserVersion: string;
  ciudad: string;
  country: string;
  datePetition: string;
  departmentId: string;
  document: string;
  documentType: string;
  email: string;
  gender: string;
  hour: string;
  ip: string;
  name: string;
  phone: string;
  presenceType: string;
  sede: string;
  subdepartmentId: string;
  typeNotify: string;
  "g-recaptcha-response"?: string;
};

export async function crearCita(
  payload: CrearCitaPayload,
  signal?: AbortSignal
): Promise<CitaCreada> {
  const { data } = await api.post<CitaCreada>("/appointments/", payload, {
    signal,
  });
  return data;
}

// Helper para extraer mensaje de error del API
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string; message?: string }>;
    const msg =
      err.response?.data?.detail ??
      err.response?.data?.message ??
      err.message;
    return typeof msg === "string" ? msg : "Error de conexión con el servidor.";
  }
  return "Error inesperado.";
}

export default api;
