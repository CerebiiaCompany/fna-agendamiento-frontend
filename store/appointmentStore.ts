import { create } from "zustand";
import type { CitaCreada, Sede, CityStructure } from "../lib/api";
 
export type TipoTramite = {
  departmentId: number;
  subdepartmentId: number;
  departmentName: string;
  subdepartmentName: string;
};
 
export type SlotHorario = {
  date: string;
  hour: string;
};
 
export type DatosCliente = {
  name: string;
  documentType: string;
  document: string;
  email: string;
  phone: string;
  gender: string;
  typeNotify: "email" | "whatsapp";
};
 
type AppointmentState = {
  pasoActual: number;
  maxPasos: number;
  ciudadId?: number;
  ciudadNombre?: string;
  ciudadDepartamentoId?: string;
  oficinas: Sede[];
  estructura: CityStructure[];
  sedeSeleccionada?: Sede;
  tipoTramiteSeleccionado?: TipoTramite;
  slotSeleccionado?: SlotHorario;
  datosCliente?: DatosCliente;
  citaConfirmada?: CitaCreada;
  // Actions
  setPasoActual: (paso: number) => void;
  setCiudad: (id: number, nombre: string, departamentoId: string) => void;
  setOficinas: (oficinas: Sede[]) => void;
  setEstructura: (estructura: CityStructure[]) => void;
  setSede: (sede: Sede) => void;
  setTipoTramite: (tipo: TipoTramite) => void;
  setSlot: (slot: SlotHorario) => void;
  setDatosCliente: (datos: DatosCliente) => void;
  setCitaConfirmada: (cita: CitaCreada) => void;
  reset: () => void;
};
 
export const useAppointmentStore = create<AppointmentState>((set) => ({
  pasoActual: 1,
  maxPasos: 5,
  oficinas: [],
  estructura: [],
  setPasoActual: (paso) => set({ pasoActual: paso }),
  setCiudad: (id, nombre, departamentoId) =>
    set({
      ciudadId: id,
      ciudadNombre: nombre,
      ciudadDepartamentoId: departamentoId,
    }),
  setOficinas: (oficinas) => set({ oficinas }),
  setEstructura: (estructura) => set({ estructura }),      // ← agregado
  setSede: (sede) => set({ sedeSeleccionada: sede }),
  setTipoTramite: (tipo) => set({ tipoTramiteSeleccionado: tipo }),
  setSlot: (slot) => set({ slotSeleccionado: slot }),
  setDatosCliente: (datos) => set({ datosCliente: datos }),
  setCitaConfirmada: (cita) => set({ citaConfirmada: cita }),
  reset: () =>
    set({
      pasoActual: 1,
      ciudadId: undefined,
      ciudadNombre: undefined,
      ciudadDepartamentoId: undefined,
      oficinas: [],
      estructura: [],
      sedeSeleccionada: undefined,
      tipoTramiteSeleccionado: undefined,
      slotSeleccionado: undefined,
      datosCliente: undefined,
      citaConfirmada: undefined,
    }),
}));