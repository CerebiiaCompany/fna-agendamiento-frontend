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
 

export type Sede = {
  id: number;
  name: string;
  direction: string;
};
 

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
 

export type CitaCreada = {
  appointmentId: number;
  status: string;
};
 

export type SubserviceIdPayload = {
  cityId: number;
  departmentId: number;
  sedeId: number;
  subserviceName: string;
  startDate: string;
  sedes: CityStructure[];
};
 
export type SubserviceIdResponse = {
  cityId: number;
  departmentId: number;
  startDate: string;
  subdepartmentId: number;
};
 
// =============================
// API CALLS
// =============================
 
export async function obtenerCiudades(
  signal?: AbortSignal
): Promise<Ciudad[]> {
  const { data } = await api.get<Ciudad[]>("/cities/", { signal });
  return data;
}
 
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
 
export async function obtenerSubserviceId(
  payload: SubserviceIdPayload,
  signal?: AbortSignal
): Promise<SubserviceIdResponse> {
  const { data } = await api.post<SubserviceIdResponse>(
    "/subservice-id/",
    payload,
    { signal }
  );
  return data;
}
 
export async function obtenerDisponibilidadPorOficinas(
  params: {
    cityId: number;
    departmentId: number;
    subdepartmentId: number;
    startDate?: string;
  },
  signal?: AbortSignal
) {
  const { data } = await api.post("/availability/offices/", params, { signal });
  return data;
}
 
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

export type CitaActiva = {
  id: number;
  name: string | null;
  date: string | null;
  hour: string | null;
  cityName: string | null;
  branchOfficeId: number | null;
  branchOfficeName: string | null;
  branchOfficeDirection: string | null;
  departmentId: number | null;
  departmentName: string | null;
  subdepartmentId: number | null;
  subdepartmentName: string | null;
  state: string | null;
  document: string | null;
  documentType: string | null;
  email: string | null;
  gender: string | null;
  phone: string | null;
  ip: string | null;
  typeNotify: string | null;
};
 
export type ReagendarPayload = CrearCitaPayload;
 
export type ReagendarResult = {
  appointmentId: number;
  status: string;
};
 
export async function obtenerCitasPorDocumento(
  document: string,
  signal?: AbortSignal
): Promise<CitaActiva[]> {
  const { data } = await api.get<CitaActiva[]>(`/by-document/${document}/`, {
    signal,
  });
  return data;
}
 
export async function reagendarCita(
  appointmentId: number,
  payload: ReagendarPayload,
  signal?: AbortSignal
): Promise<ReagendarResult> {
  const { data } = await api.patch<ReagendarResult>(
    `/reschedule/${appointmentId}/`,
    payload,
    { signal }
  );
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
    return typeof msg === "string" ? msg : "Error de conexión con el servidor.";
  }
  return "Error inesperado.";
}
 
export default api;
