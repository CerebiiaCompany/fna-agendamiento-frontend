import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// =============================
// TYPES
// =============================

export type Ciudad = {
  id: number;
  departamentoId: string;
  nombre: string;
  listed: boolean;
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

export type CityStructure = {
  id: number;
  name: string;
  direction: string;
  services: Service[];
};

// Sede utilizada en el store y pasos del wizard
export type Sede = {
  id: number;
  name: string;
  direction: string;
};


// disponibilidad

export type ScheduleHour = {
  hour: string;
};

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


// cita creada

export type CitaCreada = {
  appointmentId: number;
  status: string;
};


// =============================
// API CALLS
// =============================

// ciudades
export async function obtenerCiudades(
  signal?: AbortSignal
): Promise<Ciudad[]> {
  const { data } = await api.get<Ciudad[]>("/cities/", { signal });
  return data;
}


// estructura completa de ciudad
// sedes + servicios + subservicios
export async function obtenerEstructuraCiudad(
  cityId: number,
  signal?: AbortSignal
): Promise<CityStructure[]> {
  const { data } = await api.get<CityStructure[]>(
    `/city-structure/${cityId}/`,
    { signal }
  );

  return data;
}


// disponibilidad por oficinas
export async function obtenerDisponibilidadPorOficinas(
  params: {
    cityId: number;
    departmentId: number;
    subdepartmentId: number;
    startDate?: string;
  },
  signal?: AbortSignal
) {
  const { data } = await api.post(
    "/availability/offices/",
    params,
    { signal }
  );

  return data;
}


// crear cita
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
  const { data } = await api.post<CitaCreada>("/appointments/", payload, { signal });
  return data;
}


// =============================
// ERROR HELPER
// =============================

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string; message?: string }>;

    const msg =
      err.response?.data?.detail ??
      err.response?.data?.message ??
      err.message;

    return typeof msg === "string"
      ? msg
      : "Error de conexión con el servidor.";
  }

  return "Error inesperado.";
}

export default api;
