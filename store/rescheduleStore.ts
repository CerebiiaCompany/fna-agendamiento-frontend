// store/rescheduleStore.ts
import { create } from "zustand";
import type { CitaActiva, CityStructure, OfficeAvailability } from "../lib/api";
import type { SlotHorario } from "./appointmentStore";

type RescheduleState = {
  paso: number;

  citaActiva?: CitaActiva;

  nuevoSlot?: SlotHorario;
  nuevaOficinaId?: number;
  nuevaOficinaDescripcion?: string;

  estructura: CityStructure[];

  resultado?: { appointmentId: number; status: string };

  // Actions
  setPaso: (paso: number) => void;
  setCitaActiva: (cita: CitaActiva) => void;
  setNuevoSlot: (slot: SlotHorario, oficinaId: number, oficinaDesc: string) => void;
  setEstructura: (estructura: CityStructure[]) => void;
  setResultado: (r: { appointmentId: number; status: string }) => void;
  reset: () => void;
};

export const useRescheduleStore = create<RescheduleState>((set) => ({
  paso: 1,
  estructura: [],

  setPaso: (paso) => set({ paso }),
  setCitaActiva: (cita) => set({ citaActiva: cita }),
  setNuevoSlot: (slot, oficinaId, oficinaDesc) =>
  set({ nuevoSlot: slot, nuevaOficinaId: oficinaId, nuevaOficinaDescripcion: oficinaDesc }),
  setEstructura: (estructura) => set({ estructura }),
  setResultado: (resultado) => set({ resultado }),
  reset: () =>
    set({
      paso: 1,
      citaActiva: undefined,
      nuevoSlot: undefined,
      nuevaOficinaId: undefined,
      nuevaOficinaDescripcion: undefined,
      estructura: [],
      resultado: undefined,
    }),
}));