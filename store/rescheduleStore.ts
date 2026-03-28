import { create } from "zustand";
import type { CitaActiva, CityStructure } from "../lib/api";
import type { SlotHorario } from "./appointmentStore";

type Accion = "reagendar" | "cancelar";

type RescheduleState = {
  paso: number;
  citaActiva?: CitaActiva;
  accion?: Accion;
  nuevoSlot?: SlotHorario;
  nuevaOficinaId?: number;
  nuevaOficinaDescripcion?: string;
  nuevoDepartmentId?: number;
  nuevoSubdepartmentId?: number;
  estructura: CityStructure[];
  resultado?: { appointmentId: number; status: string };

  setPaso: (paso: number) => void;
  setCitaActiva: (cita: CitaActiva) => void;
  setAccion: (accion: Accion) => void;
  setNuevoSlot: (
    slot: SlotHorario,
    oficinaId: number,
    oficinaDesc: string,
    departmentId: number,
    subdepartmentId: number
  ) => void;
  setEstructura: (estructura: CityStructure[]) => void;
  setResultado: (r: { appointmentId: number; status: string }) => void;
  reset: () => void;
};

export const useRescheduleStore = create<RescheduleState>((set) => ({
  paso: 1,
  estructura: [],

  setPaso: (paso) => set({ paso }),
  setCitaActiva: (cita) => set({ citaActiva: cita }),
  setAccion: (accion) => set({ accion }),

  setNuevoSlot: (slot, oficinaId, oficinaDesc, departmentId, subdepartmentId) =>
    set({
      nuevoSlot: slot,
      nuevaOficinaId: oficinaId,
      nuevaOficinaDescripcion: oficinaDesc,
      nuevoDepartmentId: departmentId,
      nuevoSubdepartmentId: subdepartmentId,
    }),

  setEstructura: (estructura) => set({ estructura }),
  setResultado: (resultado) => set({ resultado }),

  reset: () =>
    set({
      paso: 1,
      accion: undefined,
      citaActiva: undefined,
      nuevoSlot: undefined,
      nuevaOficinaId: undefined,
      nuevaOficinaDescripcion: undefined,
      nuevoDepartmentId: undefined,
      nuevoSubdepartmentId: undefined,
      estructura: [],
      resultado: undefined,
    }),
}));