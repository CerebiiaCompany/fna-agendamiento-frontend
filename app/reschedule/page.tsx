"use client";

 
import { Stepper } from "../../components/ui/stepper";
import { BuscarCitaStep } from "../../components/reschedule/SearchAppointmentStep";
import { NuevoHorarioStep } from "../../components/reschedule/NewScheduleStep";
import { ConfirmacionRescheduleStep } from "../../components/reschedule/ConfirmationRescheduleStep";
import { useRescheduleStore } from "../../store/rescheduleStore";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
 
const steps = ["Buscar cita", "Nuevo horario", "Confirmación"];
 
export default function ReschedulePage() {
  const paso = useRescheduleStore((s) => s.paso);
 
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-linear-to-r from-sky-50 via-slate-50 to-emerald-50 px-4 py-10 font-sans">
        <main className="w-full max-w-5xl rounded-3xl bg-white/90 p-6 shadow-xl shadow-sky-100 ring-1 ring-sky-100 backdrop-blur-md sm:p-10">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                Fondo Nacional del Ahorro
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Reagendar cita
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Consulta una cita activa y elige un nuevo horario.
              </p>
            </div>
          </header>
 
          <section className="mb-8">
            <Stepper steps={steps} currentStep={paso} />
          </section>
 
          <section className="relative">
            {paso === 1 && <BuscarCitaStep />}
            {paso === 2 && <NuevoHorarioStep />}
            {paso === 3 && <ConfirmacionRescheduleStep />}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}