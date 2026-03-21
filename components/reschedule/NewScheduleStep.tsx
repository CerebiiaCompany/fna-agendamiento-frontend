"use client";

import { useEffect, useState } from "react";
import { useRescheduleStore } from "../../store/rescheduleStore";
import {
  obtenerCiudades,
  obtenerDisponibilidadPorOficinas,
  crearCita,
  cancelarCita,
  obtenerEstructuraCiudad,
  getApiErrorMessage,
  type OfficeAvailability,
  type ScheduleItem,
  type CityStructure,
} from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type EstadoCarga = "idle" | "loading" | "success" | "error";

function buscarIdsPorSede(
  estructura: CityStructure[],
  sedeId: number,
  departmentName: string,
  subserviceName: string
): { departmentId: number; subdepartmentId: number } | null {
  const targetDept = departmentName.trim().toUpperCase().replace(/\.+$/, "").trim();
  const targetSub = subserviceName.trim().toUpperCase().replace(/\.+$/, "").trim();
  const sede = estructura.find((s) => s.id === sedeId);
  if (!sede) return null;
  for (const service of sede.services) {
    const normalizedDept = service.name.trim().toUpperCase().replace(/\.+$/, "").trim();
    if (normalizedDept === targetDept) {

      const sub = service.subservices.find(
        (s) => s.name.trim().toUpperCase().replace(/\.+$/, "").trim() === targetSub
      );

      const subId = sub?.id ?? service.subservices[0]?.id;
      if (!subId) return null;
      return { departmentId: service.id, subdepartmentId: subId };
    }
  }
  return null;
}

export function NuevoHorarioStep() {
  const { citaActiva, estructura, setEstructura, setPaso } = useRescheduleStore();

  const [oficinasDisponibles, setOficinasDisponibles] = useState<OfficeAvailability[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [scheduleSelected, setScheduleSelected] = useState<ScheduleItem | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [slotOficinaId, setSlotOficinaId] = useState<number | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [modalExito, setModalExito] = useState(false);

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

        // Cargar estructura y disponibilidad en paralelo
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

  const handleConfirmar = async () => {
    if (!scheduleSelected || !horaSeleccionada || !slotOficinaId) {
      setErrorMensaje("Selecciona un horario para continuar.");
      return;
    }
    if (!captchaToken) {
      setErrorMensaje("Debes completar el captcha antes de confirmar.");
      return;
    }
    if (!citaActiva) return;

    const ids = citaActiva.subdepartmentName
      ? buscarIdsPorSede(
          estructura,
          slotOficinaId,
          citaActiva.subdepartmentName,
          citaActiva.departmentName ?? ""
        )
      : null;

    if (!ids) {
      setErrorMensaje(
        `No se encontró el trámite "${citaActiva.subdepartmentName}" para la sede seleccionada.`
      );
      return;
    }

    const horaNormalizada =
      horaSeleccionada.length > 5 ? horaSeleccionada.slice(0, 5) : horaSeleccionada;
    const datePetition = `${scheduleSelected.date}T${horaNormalizada}`;
    const browserVersion =
      typeof navigator !== "undefined" ? navigator.userAgent : "FNA-Frontend";

    setGuardando(true);
    setErrorMensaje(null);

    try {
      const payload = {
        acepto: "on",
        branchOfficeId: String(slotOficinaId),
        browserVersion,
        ciudad: citaActiva.cityName ?? "",
        country: "Colombia",
        datePetition,
        departmentId: String(ids.departmentId),
        document: citaActiva.document ?? "",
        documentType: citaActiva.documentType ?? "",
        email: citaActiva.email ?? "",
        gender: citaActiva.gender ?? "",
        hour: horaNormalizada,
        ip: citaActiva.ip ?? "unknown",
        name: citaActiva.name ?? "",
        phone: citaActiva.phone ?? "",
        presenceType: "Presencial",
        sede: String(slotOficinaId),
        subdepartmentId: String(ids.subdepartmentId),
        typeNotify: "email",
        "g-recaptcha-response": captchaToken,
      };

      await crearCita(payload);

      await cancelarCita(citaActiva.id);

      setGuardando(false);
      setModalExito(true);
    } catch (err) {
      setGuardando(false);
      setErrorMensaje(getApiErrorMessage(err));
    }
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
    <>
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
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide w-32">Fecha</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Horarios disponibles</th>
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
                                    <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-400 italic">
                                      Sin turnos disponibles para esta sede
                                    </td>
                                  </tr>
                                );
                              }
                              return filtered.map((s) => {
                                const sorted = sortHours(s.scheduleHours);
                                return (
                                  <tr key={s.date} className="border-b border-slate-100 last:border-b-0">
                                    <td className="px-4 py-4 align-top">
                                      <p className="text-sm font-medium text-slate-800">{capDay(s.weekDay)}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(s.date)}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="flex flex-wrap gap-2">
                                        {sorted.map((h) => {
                                          const [hh, mm] = h.hour.split(":").map(Number);
                                          const total = hh * 60 + mm + 20;
                                          const nextHour = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
                                          const isSelected =
                                            scheduleSelected?.date === s.date &&
                                            horaSeleccionada === h.hour &&
                                            slotOficinaId === oficina.officeId;
                                          return (
                                            <button
                                              key={h.hour}
                                              onClick={() => handleSeleccionarHora(s, h.hour, oficina)}
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
                      <> — <span className="font-medium">
                        {oficinasDisponibles.find((o) => o.officeId === slotOficinaId)?.descriptionOffice}
                      </span></>
                    )}
                  </div>
                )}

                {errorMensaje && (
                  <div className="mx-6 mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMensaje}
                  </div>
                )}

                {scheduleSelected && horaSeleccionada && (
                  <div className="mx-6 mb-4">
                    <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={(token: string | null) => setCaptchaToken(token)}
                    />
                  </div>
                )}

                <div className="flex justify-between px-6 pb-6">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setPaso(1)}
                    disabled={guardando}
                  >
                    Volver
                  </Button>
                  <Button
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-4 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                    disabled={!scheduleSelected || !horaSeleccionada || !captchaToken || guardando}
                    onClick={handleConfirmar}
                  >
                    {guardando ? "Reagendando..." : "Confirmar reagendado"}
                  </Button>
                </div>
              </>
            )}

            {estado === "success" && oficinasDisponibles.length === 0 && (
              <div className="px-6 pb-6">
                <p className="text-sm text-slate-400">No hay disponibilidad por el momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={modalExito} onOpenChange={setModalExito}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              ¡Cita reagendada!
            </DialogTitle>
            <p className="text-sm text-slate-500">
              La cita reagendada correctamente.
            </p>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl w-full"
              onClick={() => setPaso(1)}
            >
              Volver al inicio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}