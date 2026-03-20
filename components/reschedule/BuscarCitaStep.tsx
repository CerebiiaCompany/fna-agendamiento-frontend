"use client";

import { useState } from "react";
import { useRescheduleStore } from "../../store/rescheduleStore";
import { obtenerCitasPorDocumento, getApiErrorMessage, type CitaActiva } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";

type Estado = "idle" | "loading" | "success" | "error";

function formatFecha(date: string | null) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function BuscarCitaStep() {
  const { setCitaActiva, setPaso } = useRescheduleStore();

  const [documento, setDocumento] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);
  const [citas, setCitas] = useState<CitaActiva[]>([]);
  const [citaElegida, setCitaElegida] = useState<CitaActiva | null>(null);

  const buscar = async () => {
    if (!documento.trim()) {
      setError("Ingresa tu número de documento.");
      return;
    }
    setEstado("loading");
    setError(null);
    setCitas([]);
    setCitaElegida(null);

    try {
      const data = await obtenerCitasPorDocumento(documento.trim());
      if (data.length === 0) {
        setError("No se encontraron citas activas para este documento.");
        setEstado("error");
        return;
      }
      setCitas(data);
      setEstado("success");
    } catch (e) {
      setError(getApiErrorMessage(e));
      setEstado("error");
    }
  };

  const handleContinuar = () => {
    if (!citaElegida) {
      setError("Selecciona una cita para reagendar.");
      return;
    }
    setCitaActiva(citaElegida);
    setPaso(2);
  };

  return (
    <main className="bg-background p-4 md:p-8">
      <Card className="mx-auto shadow-md border border-slate-200 bg-white">
        <CardContent className="p-6 sm:p-8 space-y-6">

          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Consultar cita activa
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa tu número de identificación para buscar la cita que desea reagendar.
            </p>
          </div>

          {/* Buscador */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Ej: 1012345678"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <Button
              onClick={buscar}
              disabled={estado === "loading"}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-5"
            >
              {estado === "loading" ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Lista de citas */}
          {estado === "success" && citas.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {citas.length === 1
                  ? "Se encontró 1 cita:"
                  : `Se encontraron ${citas.length} citas:`}
              </p>

              {citas.map((cita) => {
                console.log(citas)
                const seleccionada = citaElegida?.id === cita.id;
                return (
                  <button
                    key={cita.id}
                    onClick={() => { setCitaElegida(cita); setError(null); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      seleccionada
                        ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">

                            {/* Nombre */}
                            <p className="text-sm font-semibold text-slate-800">{cita.name}</p>

                            {/* Ciudad y sede */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                            <span>{cita.cityName} — {cita.branchOfficeName}</span>
                            </div>

                            {/* Dirección */}
                            {cita.branchOfficeDirection && (
                            <p className="text-xs text-slate-400 leading-snug pl-4">
                                {cita.branchOfficeDirection}
                            </p>
                            )}

                            {/* Servicio / Subservicio */}
                            <div className="flex flex-wrap gap-1.5 pl-0">
                            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                                {cita.subdepartmentName}
                            </span>
                            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                                {cita.departmentName}
                            </span>
                            </div>

                            {/* Fecha y hora */}
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-sky-500" />
                                {formatFecha(cita.date)}
                            </span>
                            {cita.hour && (
                                <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-500" />
                                {cita.hour}
                                </span>
                            )}
                            </div>

                            {/* Estado */}
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            cita.state === "Confirmada"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                            {cita.state ?? "—"}
                            </span>

                        </div>
                        <ChevronRight className={`w-4 h-4 mt-1 shrink-0 transition-colors ${
                            seleccionada ? "text-sky-500" : "text-slate-300"
                        }`} />
                    </div>
                  </button>
                );
              })}

              {/* Continuar */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleContinuar}
                  disabled={!citaElegida}
                  className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl"
                >
                  Elegir nuevo horario
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </main>
  );
}