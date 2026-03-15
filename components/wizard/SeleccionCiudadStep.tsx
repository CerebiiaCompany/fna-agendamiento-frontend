"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import { obtenerCiudades, getApiErrorMessage, type Ciudad } from "../../lib/api";

type EstadoCarga = "idle" | "loading" | "success" | "error";

export function SeleccionCiudadStep() {
  const { ciudadId, setCiudad, setPasoActual } = useAppointmentStore();

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [ciudadIdLocal, setCiudadIdLocal] = useState<string>(
    ciudadId != null ? String(ciudadId) : ""
  );

  useEffect(() => {
    const abort = new AbortController();
    setEstado("loading");
    setErrorMensaje(null);
    obtenerCiudades(abort.signal)
      .then((data) => {
        setCiudades(data);
        setEstado("success");
      })
      .catch((err) => {
        if (abort.signal.aborted) return;
        setEstado("error");
        setErrorMensaje(getApiErrorMessage(err));
      });
    return () => abort.abort();
  }, []);

  const handleContinuar = () => {
    const id = ciudadIdLocal ? Number(ciudadIdLocal) : 0;
    const ciudad = ciudades.find((c) => c.id === id);
    if (!ciudad) {
      setErrorMensaje("Selecciona una ciudad.");
      return;
    }
    setCiudad(ciudad.id, ciudad.nombre, ciudad.departamentoId);
    setPasoActual(2);
  };

  const puedeContinuar = Boolean(ciudadIdLocal);

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Selecciona la ciudad
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige la ciudad donde deseas ser atendido. Luego podrás elegir el tipo
          de trámite, la sede, fecha y horario.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Ciudad
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          value={ciudadIdLocal}
          disabled={estado === "loading"}
          onChange={(e) => setCiudadIdLocal(e.target.value)}
        >
          <option value="">
            {estado === "loading"
              ? "Cargando ciudades..."
              : "Selecciona una ciudad"}
          </option>
          {ciudades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {errorMensaje && (
        <div className="sm:col-span-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMensaje}
        </div>
      )}

      <div className="mt-2 flex justify-end sm:col-span-2">
        <button
          type="button"
          disabled={!puedeContinuar}
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          onClick={handleContinuar}
        >
          Continuar al tipo de trámite
        </button>
      </div>
    </div>
  );
}
