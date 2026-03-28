"use client";

import { useEffect, useState } from "react";
import { useRescheduleStore } from "../../store/rescheduleStore";
import {
  obtenerCiudades,
  obtenerDisponibilidadPorOficinas,
  obtenerEstructuraCiudad,
  getApiErrorMessage,
  type OfficeAvailability,
  type ScheduleItem,
} from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type EstadoCarga = "idle" | "loading" | "success" | "error";

export function NuevoHorarioStep() {
  const { citaActiva, setEstructura, setPaso, setNuevoSlot, estructura } =
    useRescheduleStore();

  const [oficinasDisponibles, setOficinasDisponibles] = useState<OfficeAvailability[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [scheduleSelected, setScheduleSelected] = useState<ScheduleItem | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [slotOficinaId, setSlotOficinaId] = useState<number | null>(null);

  useEffect(() => {
    if (!citaActiva?.departmentId || !citaActiva?.subdepartmentId) return;

    const abort = new AbortController();
    const hoy = new Date().toISOString().slice(0, 10);

    const cargar = async () => {
      setEstado("loading");
      setErrorMensaje(null);
      try {
        const ciudades = await obtenerCiudades(abort.signal);
        const ciudad = ciudades.find(
          (c) => c.nombre.toLowerCase() === citaActiva.cityName?.toLowerCase()
        );
        if (!ciudad) throw new Error(`Ciudad "${citaActiva.cityName}" no encontrada.`);

        const [estructuraData, disponibilidad] = await Promise.all([
          obtenerEstructuraCiudad(ciudad.id, abort.signal),
          obtenerDisponibilidadPorOficinas(
            {
              cityId: ciudad.id,
              departmentId: citaActiva.subdepartmentId!,
              subdepartmentId: citaActiva.departmentId!,
              startDate: hoy,
            },
            abort.signal
          ),
        ]);

        if (abort.signal.aborted) return;
        setEstructura(estructuraData);
        setOficinasDisponibles(disponibilidad);
        setEstado("success");
      } catch (err) {
        if (abort.signal.aborted) return;
        setEstado("error");
        setErrorMensaje(getApiErrorMessage(err));
      }
    };

    cargar();
    return () => abort.abort();
  }, [citaActiva]);

  console.log("citaActiva:", JSON.stringify(citaActiva, null, 2))

  const handleSeleccionarHora = (
    schedule: ScheduleItem,
    hora: string,
    oficina: OfficeAvailability
  ) => {
    setScheduleSelected(schedule);
    setHoraSeleccionada(hora);
    setSlotOficinaId(oficina.officeId);
    setErrorMensaje(null);
  };

  const handleConfirmar = () => {
    if (!scheduleSelected || !horaSeleccionada || !slotOficinaId) {
      setErrorMensaje("Selecciona un horario para continuar.");
      return;
    }

    const horaNormalizada =
      horaSeleccionada.length > 5 ? horaSeleccionada.slice(0, 5) : horaSeleccionada;

    console.log("officeId seleccionado:", slotOficinaId);
    console.log("estructura disponible:", estructura.map(s => ({ id: s.id, name: s.name })));
    console.log("service buscado (departmentId):", citaActiva?.departmentId);
    console.log("subservice buscado (subdepartmentId):", citaActiva?.subdepartmentId);

    const oficina = oficinasDisponibles.find((o) => o.officeId === slotOficinaId);

    const sedeEstructura = estructura.find((s) => s.id === slotOficinaId);


    const service = sedeEstructura?.services?.find(
      (sv) => sv.name.trim() === citaActiva?.subdepartmentName?.trim()
    );

    const subservice = service?.subservices?.find(
      (sub) => sub.name.trim() === citaActiva?.departmentName?.trim()
    );


    console.log("sedeEstructura services:", JSON.stringify(sedeEstructura?.services, null, 2));

    console.log("service encontrado:", JSON.stringify(service, null, 2));

    console.log("subservice encontrado:", JSON.stringify(subservice, null, 2));

    console.log("buscando service por nombre:", citaActiva?.subdepartmentName);

    console.log("buscando subservice por nombre:", citaActiva?.departmentName);

if (!service || !subservice) {
  setErrorMensaje(
    "Esta sede no ofrece el servicio de tu cita original. Por favor elige otra sede."
  );
  return;
}

setNuevoSlot(
  { date: scheduleSelected.date, hour: horaNormalizada },
  slotOficinaId,
  oficina?.descriptionOffice ?? "",
  subservice.id,
  service.id
);

    setPaso(3);
  };

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
      <Card className="mx-auto max-w-4xl shadow-md border border-slate-200 bg-white">
        <CardContent className="p-0 overflow-hidden rounded-xl">

          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Elige el nuevo horario
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona la nueva fecha, sede y hora para tu cita.
            </p>
          </div>

          {estado === "loading" && (
            <div className="px-6 pb-6">
              <p className="text-sm text-slate-400">Cargando horarios disponibles...</p>
            </div>
          )}

          {estado === "error" && (
            <div className="px-6 pb-6">
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
                    <div className="flex items-center gap-3 bg-slate-800 text-white px-5 py-3 mx-6 rounded-lg mb-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <p className="font-medium text-sm">{oficina.descriptionOffice}</p>
                    </div>

                    <div className="mx-6 mt-3 mb-4 rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide w-32">
                              Fecha
                            </th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Horarios disponibles
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filtered = schedules.filter(
                              (s) => s.weekDay !== "DOMINGO" && s.scheduleHours.length > 0
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
                            return filtered.map((s) => {
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
                                        const [hh, mm] = h.hour.split(":").map(Number);
                                        const total = hh * 60 + mm + 20;
                                        const nextHour = `${String(
                                          Math.floor(total / 60)
                                        ).padStart(2, "0")}:${String(total % 60).padStart(
                                          2,
                                          "0"
                                        )}`;
                                        const isSelected =
                                          scheduleSelected?.date === s.date &&
                                          horaSeleccionada === h.hour &&
                                          slotOficinaId === oficina.officeId;
                                        return (
                                          <button
                                            key={h.hour}
                                            onClick={() =>
                                              handleSeleccionarHora(s, h.hour, oficina)
                                            }
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                              isSelected
                                                ? "bg-green-500 text-white border-green-500 shadow-sm"
                                                : "bg-sky-400 text-white border-sky-400 hover:bg-sky-500"
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

              {scheduleSelected && horaSeleccionada && (
                <div className="mx-6 mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">
                  Nuevo horario:{" "}
                  <span className="font-medium">
                    {capDay(scheduleSelected.weekDay)} {formatDate(scheduleSelected.date)}
                  </span>{" "}
                  a las <span className="font-medium">{horaSeleccionada}</span>
                  {slotOficinaId && (
                    <>
                      {" "}
                      —{" "}
                      <span className="font-medium">
                        {
                          oficinasDisponibles.find((o) => o.officeId === slotOficinaId)
                            ?.descriptionOffice
                        }
                      </span>
                    </>
                  )}
                </div>
              )}

              {errorMensaje && (
                <div className="mx-6 mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMensaje}
                </div>
              )}
  
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between mx-6 mb-6">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5"
                  onClick={() => setPaso(1)}
                >
                  Volver
                </Button>
                <Button
                  className="w-full sm:w-auto h-11 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                  disabled={!scheduleSelected || !horaSeleccionada}
                   onClick={handleConfirmar}
                >
                  Continuar a confirmación
                </Button>
              </div>
            </>
          )}

          {estado === "success" && oficinasDisponibles.length === 0 && (
            <div className="px-6 pb-6">
              <p className="text-sm text-slate-400">
                No hay disponibilidad por el momento.
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </main>
  );
}