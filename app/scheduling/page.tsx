"use client";

import { Stepper } from "../../components/ui/stepper";
import { SeleccionCiudadStep } from "../../components/scheduling/SeleccionCiudadStep";
import { SeleccionSedeStep } from "../../components/scheduling/SelectServiceStep";
import { SeleccionHorarioStep } from "../../components/scheduling/SeleccionHorarioStep";
import { DatosClienteStep } from "../../components/scheduling/DatosClienteStep";
import { ConfirmacionStep } from "../../components/scheduling/ConfirmacionStep";
import { useAppointmentStore } from "../../store/appointmentStore";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

const steps = [
  "Ciudad",
  "Tipo de trámite",
  "Horario y sede",
  "Datos del usuario",
  "Confirmación",
];

export default function Home() {
  const pasoActual = useAppointmentStore((s) => s.pasoActual);

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 px-4 py-10 font-sans">
      <main className="w-full max-w-5xl rounded-3xl bg-white/90 p-6 shadow-xl shadow-sky-100 ring-1 ring-sky-100 backdrop-blur-md sm:p-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              Fondo Nacional del Ahorro
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Agendamiento de citas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Completa los pasos para reservar la cita.
            </p>
          </div>
        </header>

        <section className="mb-8">
          <Stepper steps={steps} currentStep={pasoActual} />
        </section>

        <section className="relative">
          {pasoActual === 1 && <SeleccionCiudadStep />}
          {pasoActual === 2 && <SeleccionSedeStep />}
          {pasoActual === 3 && <SeleccionHorarioStep />}
          {pasoActual === 4 && <DatosClienteStep />}
          {pasoActual === 5 && <ConfirmacionStep />}
        </section>
      </main>
    </div>
    </ProtectedRoute>
  );
}

