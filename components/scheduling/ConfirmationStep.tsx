"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ReCAPTCHA from "react-google-recaptcha";
import { Calendar, MapPin, Clock, AlertCircle, User, FileText } from "lucide-react";
import { useAppointmentStore } from "../../store/appointmentStore";
import { crearCita, getApiErrorMessage, type CityStructure } from "../../lib/api";

function buscarIdsPorSede(
  estructura: CityStructure[],
  sedeId: number,
  subserviceName: string
): { departmentId: number; subdepartmentId: number } | null {
  const target = subserviceName.trim().toUpperCase().replace(/\.+$/, "").trim();
  const sede = estructura.find((s) => s.id === sedeId);
  if (!sede) return null;
  for (const service of sede.services) {
    for (const sub of service.subservices) {
      const normalizado = sub.name.trim().toUpperCase().replace(/\.+$/, "").trim();
      if (normalizado === target) {
        return { departmentId: service.id, subdepartmentId: sub.id };
      }
    }
  }
  return null;
}

export function ConfirmacionStep() {
  const {
    ciudadNombre,
    datosCliente,
    sedeSeleccionada,
    tipoTramiteSeleccionado,
    slotSeleccionado,
    citaConfirmada,
    estructura,
    setCitaConfirmada,
    setPasoActual,
    reset,
  } = useAppointmentStore();

  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
    if (!captchaToken) {
      setErrorMensaje("Debes completar el captcha antes de confirmar.");
      return;
    }

    const ids = buscarIdsPorSede(
      estructura,
      sedeSeleccionada.id,
      tipoTramiteSeleccionado.subdepartmentName
    );

    if (!ids) {
      setErrorMensaje(
        `No se encontró el trámite "${tipoTramiteSeleccionado.subdepartmentName}" para la sede ${sedeSeleccionada.name}.`
      );
      return;
    }

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
        departmentId: String(ids.departmentId),
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
        subdepartmentId: String(ids.subdepartmentId),
        typeNotify: "email",
        "g-recaptcha-response": captchaToken,
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
    // ── mismo grid de dos columnas del diseño original ──────────────────────
    <div className="grid gap-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:grid-cols-[1.1fr_1.2fr] sm:p-8">

      {/* ── Columna izquierda ─────────────────────────────────────────────── */}
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">
          Revisa y confirma los datos de la cita
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Verifica que toda la información esté correcta antes de confirmar.
        </p>

        {/* Tarjeta de resumen */}
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm overflow-hidden">

          {/* Datos del cliente */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Datos del cliente
            </p>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex gap-2 items-center min-w-0">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 truncate">{datosCliente.name}</span>
              </div>
              <div className="flex gap-2 items-center min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 truncate">
                  {datosCliente.documentType} • {datosCliente.document}
                </span>
              </div>
              <p className="text-xs text-slate-500 pl-5 break-all">
                {datosCliente.email} • {datosCliente.phone}
              </p>
            </div>
          </div>

          <hr className="border-dashed border-slate-100" />

          {/* Sede y trámite */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sede y trámite
            </p>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex gap-2 items-center min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 truncate">{sedeSeleccionada.name}</span>
              </div>
              <p className="text-xs text-slate-500 pl-5 break-words">{sedeSeleccionada.direction}</p>
              <div className="pl-5">
                <span className="text-xs font-medium text-slate-700 break-words">
                  Trámite: {tipoTramiteSeleccionado.subdepartmentName}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-dashed border-slate-100" />

          {/* Fecha y horario */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha y horario
            </p>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex gap-2 items-start min-w-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-900 break-words">{fechaFormateada}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500">{horaNormalizada}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMensaje && (
          <div className="mt-3 flex gap-2 items-start rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{errorMensaje}</span>
          </div>
        )}

        {/* Captcha */}
        {!cita && (
          <div className="mt-4 overflow-hidden">
            <div className="scale-[0.95] origin-left sm:scale-100">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token: string | null) => setCaptchaToken(token)}
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {!cita && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setPasoActual(4)}
              disabled={estado === "loading"}
            >
              Volver
            </button>
          )}

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

      {/* ── Columna derecha ───────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between min-w-0">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Confirmación
          </p>

          {cita ? (
            <>
              <p className="mt-1 text-base font-semibold">¡La cita ha sido agendada!</p>
              <p className="mt-2 text-xs font-medium">Recomendaciones al cliente:</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
                <li>Llega 10 minutos antes de la hora programada.</li>
                <li>Lleva tu documento de identidad y los soportes del trámite.</li>
                <li>Si no puedes asistir, cancela o reprograma.</li>
              </ul>
            </>
          ) : (
            <p className="mt-1 text-xs">
              Al confirmar se generará la cita en el sistema del FNA.
            </p>
          )}
        </div>

        {cita && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
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