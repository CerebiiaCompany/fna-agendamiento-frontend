"use client";

import { useState } from "react";
import { useRescheduleStore } from "../../store/rescheduleStore";
import { reagendarCita, getApiErrorMessage } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

function formatFecha(date: string | null | undefined) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function ConfirmacionRescheduleStep() {
  const {
    citaActiva,
    nuevoSlot,
    nuevaOficinaId,
    nuevaOficinaDescripcion,
    nuevoDepartmentId,
    nuevoSubdepartmentId,
    setResultado,
    setPaso,
    resultado,
  } = useRescheduleStore();

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleConfirmar = async () => {
    if (!citaActiva || !nuevoSlot || !nuevaOficinaId) return;

    if (!captchaToken) {
      setError("Debes completar el captcha antes de confirmar.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const horaNormalizada = nuevoSlot.hour.length > 5
        ? nuevoSlot.hour.slice(0, 5)
        : nuevoSlot.hour;

      const payload = {
        acepto: "on",
        branchOfficeId: String(nuevaOficinaId),
        browserVersion: navigator.userAgent.slice(0, 200),
        ciudad: String(citaActiva.cityName ?? ""),
        country: "Colombia",
        datePetition: `${nuevoSlot.date}T${horaNormalizada}`,
        departmentId: String(nuevoSubdepartmentId ?? ""),
        document: citaActiva.document ?? "",
        documentType: citaActiva.documentType ?? "",
        email: citaActiva.email ?? "",
        gender: citaActiva.gender ?? "",
        hour: horaNormalizada,
        ip: citaActiva.ip ?? "0.0.0.0",
        name: citaActiva.name ?? "",
        phone: citaActiva.phone ?? "",
        presenceType: "Presencial",
        sede: String(nuevaOficinaId),
        subdepartmentId: String(nuevoDepartmentId ?? ""),
        typeNotify: "email",
        "g-recaptcha-response": captchaToken,
      };

      const result = await reagendarCita(citaActiva.id, payload);
      setResultado(result);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setEnviando(false);
    }
  };

  if (resultado) {
    return (
      <main className="bg-background p-4 md:p-8">
        <Card className="mx-auto max-w-lg shadow-md border border-slate-200 bg-white">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">¡Cita reagendada!</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tu cita ha sido reagendada exitosamente.
              </p>
            </div>
            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 space-y-2 text-left">
              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                <span><span className="font-medium">Nueva fecha:</span> {formatFecha(nuevoSlot?.date)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <span><span className="font-medium">Hora:</span> {nuevoSlot?.hour}</span>
              </div>
              {nuevaOficinaDescripcion && (
                <div className="flex gap-2 items-center">
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                  <span><span className="font-medium">Sede:</span> {nuevaOficinaDescripcion}</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
               className="w-full sm:w-auto h-11 px-5 border-blue-500 text-blue-500"
               onClick={() => setPaso(1)}
               disabled={enviando}
            >
              Volver a reagendar cita
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-background p-4 md:p-8">
      <Card className="mx-auto max-w-lg shadow-md border border-slate-200 bg-white">
        <CardContent className="p-6 sm:p-8 space-y-6">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Confirmar reagendado</h2>
            <p className="mt-1 text-sm text-slate-500">
              Revisa los cambios antes de confirmar.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cita actual
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-1.5">
              <div className="flex gap-2 items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatFecha(citaActiva?.date)} — {citaActiva?.hour ?? "—"}
              </div>
              {citaActiva?.branchOfficeName && (
                <div className="flex gap-2 items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {citaActiva.branchOfficeName}
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-slate-300 text-lg">↓</div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">
              Nuevo horario
            </p>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 space-y-1.5">
              <div className="flex gap-2 items-center">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span className="font-medium">{formatFecha(nuevoSlot?.date)}</span>
                <Clock className="w-3.5 h-3.5 text-sky-500 ml-1" />
                <span className="font-medium">{nuevoSlot?.hour}</span>
              </div>
              {nuevaOficinaDescripcion && (
                <div className="flex gap-2 items-center">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {nuevaOficinaDescripcion}
                </div>
              )}
            </div>
          </div>

          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token: string | null) => setCaptchaToken(token)}
          />

          {error && (
            <div className="flex gap-2 items-start rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between ">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-5"
              onClick={() => setPaso(2)}
              disabled={enviando}
            >
              Volver
            </Button>
            <Button
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              onClick={handleConfirmar}
              disabled={!captchaToken || enviando}
            >
              {enviando ? "Reagendando..." : "Confirmar reagendado"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </main>
  );
}