"use client";

import { useState } from "react";
import { useRescheduleStore } from "../../store/rescheduleStore";
import { obtenerCitasPorDocumento, getApiErrorMessage, type CitaActiva, type Estado } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, MapPin, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { cancelarCita } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const [cancelando, setCancelando] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    description: "",
  });
  
  const buscar = async () => {
    if (!documento.trim()) {
      setError("Ingresa tu número de documento.");
      return;
    }

    const doc = documento.trim();
    setDocumento("");

    setEstado("loading");
    setError(null);
    setCitaElegida(null);

    try {
      const data = await obtenerCitasPorDocumento(doc);

      if (data.length === 0) {
        setError("No se encontraron citas activas para este documento.");
        setEstado("error");
        return;
      }

      setCitas(data);
      setEstado("success");

    } catch (e) {
      const msg = getApiErrorMessage(e);

      if (msg.includes("No tienes cita activa")) {
        setModal({
          open: true,
          title: "Sin cita activa",
          description: "No encontramos una cita activa asociada a este documento.",
        });
        setEstado("idle");
        return;
      }

      setError(msg);
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

  const handleCancelar = async () => {
    if (!citaElegida) return;

    try {
      setCancelando(true);

      await cancelarCita(citaElegida.id);

      setCitas((prev) => prev.filter(c => c.id !== citaElegida.id));
      setCitaElegida(null);

      setCancelando(false);

      setTimeout(() => {
        setModalExito(true);
      }, 200);

    } catch (e) {
      setCancelando(false);
      setError(getApiErrorMessage(e));
      setEstado("error");
    }
  };

  return (
    <>
    <main className="bg-background p-4 md:p-8">
      <Card className="mx-auto shadow-md border border-slate-200 bg-white">
        <CardContent className="p-6 sm:p-8 space-y-6">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Consultar cita activa
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa el número de identificación para buscar la cita.
            </p>
          </div>

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
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-5 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {estado === "loading" ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {estado === "success" && citas.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {citas.length === 1
                  ? "Se encontró 1 cita:"
                  : `Se encontraron ${citas.length} citas:`}
              </p>

              {citas.map((cita) => {
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

                            <p className="text-sm font-semibold text-slate-800">{cita.name}</p>

                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                            <span>{cita.cityName} — {cita.branchOfficeName}</span>
                            </div>

                            {cita.branchOfficeDirection && (
                            <p className="text-xs text-slate-400 leading-snug pl-4">
                                {cita.branchOfficeDirection}
                            </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 pl-0">
                            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                                {cita.subdepartmentName}
                            </span>
                            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                                {cita.departmentName}
                            </span>
                            </div>

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

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={!citaElegida}
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar cita
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="max-w-md rounded-2xl p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                      </div>

                      <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                        ¿Cancelar cita?
                      </AlertDialogTitle>

                      <AlertDialogDescription className="text-sm text-slate-500">
                        {citaElegida && (
                          <>
                            Vas a cancelar la cita de{" "}
                            <b>{citaElegida.name}</b> el{" "}
                            <b>{formatFecha(citaElegida.date)}</b>.
                            <br />
                            <span className="text-red-500 font-medium">
                              Esta acción no se puede deshacer.
                            </span>
                          </>
                        )}
                      </AlertDialogDescription>
                    </div>

                    <AlertDialogFooter className="mt-6 flex gap-2 justify-center">
                      <AlertDialogCancel className="rounded-xl px-4">
                        Volver
                      </AlertDialogCancel>

                      <AlertDialogAction
                        onClick={handleCancelar}
                        disabled={cancelando}
                        className="bg-red-600 hover:bg-red-700 rounded-xl px-4"
                      >
                        {cancelando ? "Cancelando..." : "Sí, cancelar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  onClick={handleContinuar}
                  disabled={!citaElegida}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  Elegir nuevo horario
                </Button>
              </div>
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
            Cita cancelada
          </DialogTitle>

          <p className="text-sm text-slate-500">
            Tu cita fue cancelada correctamente.
          </p>
        </div>

      </DialogContent>
    </Dialog>

    <Dialog open={modal.open} onOpenChange={(open) => setModal(prev => ({ ...prev, open }))}>
      <DialogContent className="max-w-md rounded-2xl p-6">

        <div className="flex flex-col items-center text-center space-y-4">
          
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100">
            <AlertTriangle className="w-7 h-7 text-yellow-600" />
          </div>

          <DialogTitle className="text-xl font-semibold text-slate-900">
            {modal.title}
          </DialogTitle>

          <p className="text-sm text-slate-500">
            {modal.description}
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}