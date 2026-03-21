"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import {
  obtenerEstructuraCiudad,
  getApiErrorMessage,
  type CityStructure,
} from "../../lib/api";
import {
  TRAMITES_PREDETERMINADOS,
  getTramitesAgrupados,
  type TramiteOption,
} from "../../lib/sevices";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EstadoCarga = "idle" | "loading" | "success" | "error";

function normalizarNombre(name: string): string {
  return name.trim().toUpperCase().replace(/\.+$/, "").trim();
}

function buscarSubservicioPorNombre(
  estructura: CityStructure[],
  subserviceName: string
): { sedeId: number; departmentId: number; subdepartmentId: number }[] {
  const target = normalizarNombre(subserviceName);
  const resultados: { sedeId: number; departmentId: number; subdepartmentId: number }[] = [];

  for (const sede of estructura) {
    for (const service of sede.services) {
      for (const sub of service.subservices) {
        if (normalizarNombre(sub.name) === target) {
          resultados.push({
            sedeId: sede.id,
            departmentId: service.id,
            subdepartmentId: sub.id,
          });
          break;
        }
      }
    }
  }

  return resultados;
}

export function SeleccionSedeStep() {
  const {
    ciudadId,
    tipoTramiteSeleccionado,
    setTipoTramite,
    setOficinas,
    setEstructura, 
    setPasoActual,
  } = useAppointmentStore();

  const [estructuraLocal, setEstructuraLocal] = useState<CityStructure[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [subserviceSeleccionado, setSubserviceSeleccionado] = useState<string>(
    tipoTramiteSeleccionado?.subdepartmentName ?? ""
  );

  const tramitesAgrupados = getTramitesAgrupados();


  useEffect(() => {
    if (ciudadId == null) return;

    const abort = new AbortController();

    const cargar = async () => {
      setEstado("loading");
      setErrorMensaje(null);

      try {
        const data: CityStructure[] = await obtenerEstructuraCiudad(
          ciudadId,
          abort.signal
        );

        if (abort.signal.aborted) return;

        setEstructuraLocal(data);
        setEstructura(data);
        setOficinas(
          data.map((b) => ({ id: b.id, name: b.name, direction: b.direction }))
        );
        setEstado("success");
      } catch (err) {
        if (abort.signal.aborted) return;
        setEstado("error");
        setErrorMensaje(getApiErrorMessage(err));
      }
    };

    cargar();
    return () => abort.abort();
  }, [ciudadId, setOficinas, setEstructura]);

  const handleContinuar = () => {
    if (!subserviceSeleccionado) {
      setErrorMensaje("Selecciona un tipo de trámite.");
      return;
    }

    const resultados = buscarSubservicioPorNombre(estructuraLocal, subserviceSeleccionado);

    if (resultados.length === 0) {
      setErrorMensaje(
        `No se encontró el trámite "${subserviceSeleccionado}" para esta ciudad.`
      );
      return;
    }

    const tramite = TRAMITES_PREDETERMINADOS.find(
      (t) =>
        normalizarNombre(t.subserviceName) ===
        normalizarNombre(subserviceSeleccionado)
    );

    const { departmentId, subdepartmentId } = resultados[0];

    setTipoTramite({
      departmentId,
      subdepartmentId,
      departmentName: tramite?.serviceName ?? "",
      subdepartmentName: subserviceSeleccionado,
    });

    setErrorMensaje(null);
    setPasoActual(3);
  };

  const puedeContinuar = Boolean(subserviceSeleccionado) && estado === "success";

  return (
    <main className="bg-background p-4 md:p-8">
      <Card className="mx-auto max-w-4xl shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Selecciona el tipo de trámite
            </h2>
            <p className="text-sm text-muted-foreground">
              Con base en la ciudad elegida, selecciona el trámite que deseas
              realizar. En el siguiente paso elegirás la sede, fecha y horario.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tipo de trámite
            </label>

            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              value={subserviceSeleccionado}
              disabled={estado === "loading"}
              onChange={(e) => {
                setSubserviceSeleccionado(e.target.value);
                setErrorMensaje(null);
              }}
            >
              <option value="">
                {estado === "loading"
                  ? "Cargando..."
                  : "Seleccione un tipo de turno"}
              </option>

              {Object.entries(tramitesAgrupados).map(([serviceName, opciones]) => (
                <optgroup key={serviceName} label={serviceName}>
                  {opciones.map((op: TramiteOption) => (
                    <option key={op.subserviceName} value={op.subserviceName}>
                      {op.subserviceName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {estado === "error" && errorMensaje && (
              <p className="text-xs text-destructive">{errorMensaje}</p>
            )}
          </div>

          {errorMensaje && estado !== "error" && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMensaje}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="order-2 sm:order-1"
              onClick={() => setPasoActual(1)}
            >
              Volver
            </Button>

            <Button
              className="order-1 sm:order-2 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-400/40 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              disabled={!puedeContinuar}
              onClick={handleContinuar}
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}