"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import {
  obtenerDisponibilidadPorOficinas,
  getApiErrorMessage,
  type OfficeAvailability,
  type ScheduleItem,
} from "../../lib/api";

type EstadoCarga = "idle" | "loading" | "success" | "error";

export function SeleccionHorarioStep() {
  const {
    ciudadId,
    ciudadNombre,
    oficinas,
    sedeSeleccionada,
    tipoTramiteSeleccionado,
    slotSeleccionado,
    setSede,
    setSlot,
    setPasoActual,
  } = useAppointmentStore();

  const [oficinasDisponibles, setOficinasDisponibles] = useState<
    OfficeAvailability[]
  >([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [officeIdLocal, setOfficeIdLocal] = useState<number | "">(
    sedeSeleccionada?.id ?? ""
  );
  const [scheduleSelected, setScheduleSelected] = useState<ScheduleItem | null>(
    null
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>(
    slotSeleccionado?.hour ?? ""
  );

  const oficinaActual = oficinasDisponibles.find(
    (o) => o.officeId === officeIdLocal
  );
  const schedules = oficinaActual?.schedules ?? [];
  const scheduleHours = scheduleSelected?.scheduleHours ?? [];
  const horas = scheduleHours.map((sh) => sh.hour);

  useEffect(() => {
    // departmentId para horarios = id del subservicio (tipo de trámite seleccionado)
    if (!ciudadId || !tipoTramiteSeleccionado) {
      setOficinasDisponibles([]);
      return;
    }

    const abort = new AbortController();
    setEstado("loading");
    setErrorMensaje(null);

    const hoy = new Date().toISOString().slice(0, 10);

    obtenerDisponibilidadPorOficinas(
      {
        cityId: ciudadId,
        departmentId: tipoTramiteSeleccionado.subdepartmentId,
        startDate: hoy,
      },
      abort.signal
    )
      .then((data) => {
        setOficinasDisponibles(data);
        setEstado("success");
      })
      .catch((err) => {
        if (abort.signal.aborted) return;
        setEstado("error");
        setOficinasDisponibles([]);
        setErrorMensaje(getApiErrorMessage(err));
      });

    return () => abort.abort();
  }, [ciudadId, tipoTramiteSeleccionado?.subdepartmentId]);

  const handleOfficeChange = (id: string) => {
    const num = id === "" ? "" : Number(id);
    setOfficeIdLocal(num);
    setScheduleSelected(null);
    setHoraSeleccionada("");
    if (num !== "") {
      const s = oficinas.find((o) => o.id === num);
      if (s) setSede(s);
    }
  };

  const handleContinuar = () => {
    const sede = oficinas.find((o) => o.id === officeIdLocal) ?? sedeSeleccionada;
    if (!sede) {
      setErrorMensaje("Selecciona una sede.");
      return;
    }
    if (!scheduleSelected) {
      setErrorMensaje("Selecciona una fecha.");
      return;
    }
    if (!horaSeleccionada) {
      setErrorMensaje("Selecciona un horario.");
      return;
    }
    setSede(sede);
    setSlot({ date: scheduleSelected.date, hour: horaSeleccionada });
    setPasoActual(4);
  };

  const puedeContinuar = Boolean(
    officeIdLocal !== "" && scheduleSelected && horaSeleccionada
  );

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-lg">
        <div className="p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Section - Sede y Fecha */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Selecciona la sede, fecha y horario
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Elige la oficina, el día y uno de los horarios disponibles.
                </p>
              </div>

              <div className="space-y-4">
                {/* Sede */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Sede
                  </label>
                  <select
                    className="w-full rounded-md border border-primary/50 bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                    value={officeIdLocal === "" ? "" : String(officeIdLocal)}
                    onChange={(e) => handleOfficeChange(e.target.value)}
                    disabled={estado === "loading"}
                  >
                    <option value="">
                      {estado === "loading"
                        ? "Cargando oficinas..."
                        : "Selecciona una sede"}
                    </option>
                    {oficinasDisponibles.map((o) => (
                      <option key={o.officeId} value={o.officeId}>
                        {o.descriptionOffice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                {oficinaActual && schedules.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Fecha
                    </label>
                    <div className="rounded-md border border-primary/50 bg-background p-1">
                      <div className="mb-2 rounded-t-md border-b border-primary/30 bg-accent/30 px-3 py-2 text-sm font-medium text-foreground">
                        {scheduleSelected
                          ? `${scheduleSelected.weekDay} ${scheduleSelected.date}`
                          : "Selecciona una fecha"}
                      </div>
                      <div className="max-h-52 overflow-y-auto px-2 py-1">
                        <div className="space-y-1 text-sm">
                          {schedules.map((s) => (
                            <button
                              key={s.date}
                              type="button"
                              disabled={s.disabled}
                              onClick={() => {
                                setScheduleSelected(s);
                                setHoraSeleccionada("");
                              }}
                              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition ${
                                scheduleSelected?.date === s.date
                                  ? "bg-primary text-primary-foreground shadow"
                                  : "hover:bg-accent"
                              } ${
                                s.disabled ? "cursor-not-allowed opacity-50" : ""
                              }`}
                            >
                              <span>
                                {s.weekDay} {s.date}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Time Slots */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Horarios disponibles
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecciona el horario de tu preferencia
                </p>
              </div>

              {estado === "loading" && (
                <p className="text-sm text-muted-foreground">
                  Cargando oficinas y horarios...
                </p>
              )}
              {estado === "error" && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMensaje}
                </div>
              )}
              {estado === "success" &&
                scheduleSelected &&
                horas.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay horarios para este día.
                  </p>
                )}
              {estado === "success" &&
                (!scheduleSelected || !oficinaActual) && (
                  <p className="text-sm text-muted-foreground">
                    Primero elige una sede y una fecha.
                  </p>
                )}

              {estado === "success" && horas.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {horas.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setHoraSeleccionada(time)}
                      className={`h-12 rounded-md border text-sm font-medium transition-all ${
                        horaSeleccionada === time
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "border-border hover:border-primary hover:bg-accent"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setPasoActual(2)}
                  className="order-2 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent sm:order-1"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleContinuar}
                  disabled={!puedeContinuar}
                  className="order-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                >
                  Continuar a datos del usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
