"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import {
  obtenerDisponibilidadPorOficinas,
  getApiErrorMessage,
  type OfficeAvailability,
  type ScheduleItem,
} from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type EstadoCarga = "idle" | "loading" | "success" | "error";

export function SeleccionHorarioStep() {
  const {
    ciudadId,
    oficinas,
    sedeSeleccionada,
    tipoTramiteSeleccionado,
    slotSeleccionado,
    setSede,
    setSlot,
    setPasoActual,
  } = useAppointmentStore();

  const [oficinasDisponibles, setOficinasDisponibles] =
    useState<OfficeAvailability[]>([]);

  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [scheduleSelected, setScheduleSelected] = useState<ScheduleItem | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>(
    slotSeleccionado?.hour ?? ""
  );
  const [slotSeleccionadoOfficeId, setSlotSeleccionadoOfficeId] = useState<number | null>(null);

  // ── Carga disponibilidad ─────────────────────────────────────────────────
  useEffect(() => {
    const abort = new AbortController();

    const cargar = async () => {
      if (!ciudadId || !tipoTramiteSeleccionado) {
        setOficinasDisponibles([]);
        return;
      }

      setEstado("loading");
      setErrorMensaje(null);

      const hoy = new Date().toISOString().slice(0, 10);

      try {
        const data = await obtenerDisponibilidadPorOficinas(
          {
            cityId: ciudadId,
            departmentId: tipoTramiteSeleccionado.departmentId,
            subdepartmentId: tipoTramiteSeleccionado.subdepartmentId,
            startDate: hoy,
          },
          abort.signal
        );

        if (abort.signal.aborted) return;

        setOficinasDisponibles(data);
        setEstado("success");
      } catch (err) {
        if (abort.signal.aborted) return;
        setEstado("error");
        setOficinasDisponibles([]);
        setErrorMensaje(getApiErrorMessage(err));
      }
    };

    cargar();
    return () => abort.abort();
  }, [ciudadId, tipoTramiteSeleccionado]);

  const handleSeleccionarHora = (
    schedule: ScheduleItem,
    hora: string,
    oficina: OfficeAvailability
  ) => {
    setScheduleSelected(schedule);
    setHoraSeleccionada(hora);
    setSlotSeleccionadoOfficeId(oficina.officeId);
    setErrorMensaje(null);
  };

  const handleContinuar = () => {
    if (!scheduleSelected) {
      setErrorMensaje("Selecciona una fecha.");
      return;
    }

    if (!horaSeleccionada) {
      setErrorMensaje("Selecciona un horario.");
      return;
    }

    if (!slotSeleccionadoOfficeId) {
      setErrorMensaje("No se encontró la sede del horario seleccionado.");
      return;
    }

    const sedeDelSlot = oficinas.find((o) => o.id === slotSeleccionadoOfficeId);
    if (sedeDelSlot) {
      setSede(sedeDelSlot);
    }

    setSlot({
      date: scheduleSelected.date,
      hour: horaSeleccionada,
    });

    setPasoActual(4);
  };

  const puedeContinuar = Boolean(scheduleSelected && horaSeleccionada);

  const sortHours = (hours: { hour: string }[]) =>
    [...hours].sort((a, b) => a.hour.localeCompare(b.hour));

  const capDay = (day: string) =>
    day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <main className="bg-background p-4 md:p-8">
      <Card className="mx-auto max-w-4xl shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Selecciona la fecha y horario
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige el día y uno de los horarios disponibles.
            </p>
          </div>
          {estado === "loading" && (
            <div className="px-6 pb-6">
              <p className="text-sm text-muted-foreground">
                Cargando horarios disponibles...
              </p>
            </div>
          )}
          {estado === "error" && (
            <div className="px-6 pb-6">
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMensaje}
              </div>
            </div>
          )}
          {estado === "success" && oficinasDisponibles.length > 0 && (
            <>
              {oficinasDisponibles.map((oficina) => {
                const schedules = oficina.schedules ?? [];

                return (
                  <div key={oficina.officeId}>
                    <div className="flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-lg mb-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight">
                          {oficina.descriptionOffice}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 mb-4 rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 tracking-wide uppercase w-32">
                              Fecha
                            </th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 tracking-wide uppercase">
                              Horarios disponibles
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filtered = schedules.filter(
                              (s: ScheduleItem) =>
                                s.weekDay !== "DOMINGO" &&
                                s.scheduleHours.length > 0
                            );

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td
                                    colSpan={2}
                                    className="px-4 py-6 text-center text-sm text-slate-400 italic"
                                  >
                                    Sin turnos disponibles para esta sede
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((s: ScheduleItem) => {
                              const sorted = sortHours(s.scheduleHours);
                              return (
                                <tr
                                  key={s.date}
                                  className="border-b border-slate-100 last:border-b-0"
                                >
                                  <td className="px-4 py-4 align-top">
                                    <p className="text-sm font-medium text-slate-800">
                                      {capDay(s.weekDay)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {formatDate(s.date)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      {sorted.map((h) => {
                                        const nextHour = (() => {
                                          const [hh, mm] = h.hour
                                            .split(":")
                                            .map(Number);
                                          const total = hh * 60 + mm + 20;
                                          return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
                                        })();

                                        const isSelected =
                                          scheduleSelected?.date === s.date &&
                                          horaSeleccionada === h.hour &&
                                          slotSeleccionadoOfficeId === oficina.officeId;

                                        return (
                                          <button
                                            key={h.hour}
                                            onClick={() =>
                                              handleSeleccionarHora(s, h.hour, oficina)
                                            }
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                              ${
                                                isSelected
                                                  ? "bg-green-500 text-white border-green-500 shadow-sm"
                                                  : "bg-sky-400 text-white border-sky-400 hover:bg-sky-500 hover:border-sky-500"
                                              }`}
                                          >
                                            {h.hour} - {nextHour}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Error validación */}
              {errorMensaje && (
                <div className="mx-6 mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMensaje}
                </div>
              )}

              {scheduleSelected && horaSeleccionada && (
                <div className="mx-6 mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">
                  Seleccionado:{" "}
                  <span className="font-medium">
                    {capDay(scheduleSelected.weekDay)}{" "}
                    {formatDate(scheduleSelected.date)}
                  </span>{" "}
                  a las{" "}
                  <span className="font-medium">{horaSeleccionada}</span>
                  {slotSeleccionadoOfficeId && (
                    <>
                      {" "}—{" "}
                      <span className="font-medium">
                        {
                          oficinasDisponibles.find(
                            (o) => o.officeId === slotSeleccionadoOfficeId
                          )?.descriptionOffice
                        }
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => setPasoActual(2)}
                >
                  Volver
                </Button>

                <Button
                  className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                  disabled={!puedeContinuar}
                  onClick={handleContinuar}
                >
                  Continuar
                </Button>
              </div>
            </>
          )}

          {estado === "success" && oficinasDisponibles.length === 0 && (
            <div className="px-6 pb-6">
              <p className="text-sm text-muted-foreground">
                No hay disponibilidad para la ciudad seleccionada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}