"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppointmentStore } from "../../store/appointmentStore";
import { crearCita, getApiErrorMessage } from "../../lib/api";

export function ConfirmacionStep() {
  const {
    ciudadNombre,
    datosCliente,
    sedeSeleccionada,
    tipoTramiteSeleccionado,
    slotSeleccionado,
    citaConfirmada,
    setCitaConfirmada,
    setPasoActual,
    reset,
  } = useAppointmentStore();

  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  if (!datosCliente || !sedeSeleccionada || !tipoTramiteSeleccionado || !slotSeleccionado) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Faltan datos para confirmar la cita. Vuelve a los pasos anteriores.
      </div>
    );
  }

  const fechaFormateada = format(
    new Date(slotSeleccionado.date + "T12:00:00"),
    "EEEE d 'de' MMMM yyyy",
    { locale: es }
  );
  const horaNormalizada =
    slotSeleccionado.hour.length > 5
      ? slotSeleccionado.hour.slice(0, 5)
      : slotSeleccionado.hour;

  const handleConfirmar = async () => {
    setEstado("loading");
    setErrorMensaje(null);

    const datePetition = `${slotSeleccionado.date}T${horaNormalizada}`;
    const browserVersion =
      typeof navigator !== "undefined" ? navigator.userAgent : "FNA-Frontend";

    try {
      const payload = {
        acepto: "on",
        branchOfficeId: String(sedeSeleccionada.id),
        browserVersion,
        ciudad: (ciudadNombre ?? sedeSeleccionada.name).trim(),
        country: "Colombia",
        datePetition,
        departmentId: String(tipoTramiteSeleccionado.departmentId),
        document: datosCliente.document,
        documentType: datosCliente.documentType,
        email: datosCliente.email,
        gender: datosCliente.gender,
        hour: horaNormalizada,
        ip: "unknown",
        name: datosCliente.name,
        phone: datosCliente.phone,
        presenceType: "Presencial",
        sede: String(sedeSeleccionada.id),
        subdepartmentId: String(tipoTramiteSeleccionado.subdepartmentId),
        typeNotify: datosCliente.typeNotify ?? "email",
      };
      const cita = await crearCita(payload);
      setCitaConfirmada(cita);
      setEstado("success");
    } catch (err) {
      setEstado("error");
      setErrorMensaje(getApiErrorMessage(err));
    }
  };

  const cita = citaConfirmada;

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:grid-cols-[1.1fr_1.2fr] sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Revisa y confirma los datos de tu cita
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Verifica que toda la información esté correcta antes de confirmar.
        </p>

        <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Datos del cliente
            </p>
            <p className="mt-1 text-slate-900">{datosCliente.name}</p>
            <p className="text-xs text-slate-500">
              {datosCliente.documentType} • {datosCliente.document}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {datosCliente.email} • {datosCliente.phone}
            </p>
          </div>
          <hr className="border-dashed border-slate-100" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sede y trámite
            </p>
            <p className="mt-1 text-slate-900">{sedeSeleccionada.name}</p>
            <p className="text-xs text-slate-500">{sedeSeleccionada.direction}</p>
            <p className="mt-2 text-xs font-medium text-slate-700">
              Trámite: {tipoTramiteSeleccionado.subdepartmentName}
            </p>
          </div>
          <hr className="border-dashed border-slate-100" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha y horario
            </p>
            <p className="mt-1 text-slate-900">{fechaFormateada}</p>
            <p className="text-xs text-slate-500">{horaNormalizada}</p>
          </div>
        </div>

        {errorMensaje && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMensaje}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => setPasoActual(4)}
            disabled={estado === "loading"}
          >
            Volver
          </button>
          {!cita && (
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={estado === "loading"}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-400/40 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {estado === "loading" ? "Confirmando cita..." : "Confirmar cita"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Confirmación
          </p>
          {cita ? (
            <>
              <p className="mt-1 text-base font-semibold">¡Tu cita ha sido agendada!</p>
              <p className="mt-1 text-xs">
                Guarda el ID de tu cita. Te enviaremos el detalle a tu correo.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                <span className="text-xs font-medium text-slate-500">ID de cita</span>
                <span className="text-sm font-semibold text-emerald-700">
                  {cita.appointmentId}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium">Estado: {cita.status}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
                <li>Llega 10 minutos antes de la hora programada.</li>
                <li>Lleva tu documento de identidad y los soportes del trámite.</li>
                <li>Si no puedes asistir, cancela o reprograma desde los canales del FNA.</li>
              </ul>
            </>
          ) : (
            <p className="mt-1 text-xs">
              Al confirmar se generará tu cita en el sistema del FNA.
            </p>
          )}
        </div>
        {cita && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => reset()}
            >
              Agendar otra cita
            </button>
          </div>
        )}
      </div>
    </div>
  );
}