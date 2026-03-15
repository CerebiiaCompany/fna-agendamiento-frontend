"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import {
  obtenerSedesPorCiudad,
  obtenerServiciosPorSede,
  getApiErrorMessage,
  type Service,
} from "../../lib/api";
import type { TipoTramite as TipoTramiteStore } from "../../store/appointmentStore";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type EstadoCarga = "idle" | "loading" | "success" | "error";
type TipoTramiteOption = TipoTramiteStore & { optionKey: string };

export function SeleccionSedeStep() {
  const {
    ciudadId,
    tipoTramiteSeleccionado,
    setTipoTramite,
    setOficinas,
    setPasoActual,
  } = useAppointmentStore();

  const [servicios, setServicios] = useState<Service[]>([]);
  const [opcionesTramite, setOpcionesTramite] = useState<TipoTramiteOption[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [optionKey, setOptionKey] = useState<string>(
    tipoTramiteSeleccionado
      ? `${tipoTramiteSeleccionado.departmentId}-${tipoTramiteSeleccionado.subdepartmentId}`
      : ""
  );

  useEffect(() => {
    if (ciudadId == null) return;

    const abort = new AbortController();
    setEstado("loading");
    setErrorMensaje(null);

    obtenerSedesPorCiudad(ciudadId, abort.signal)
      .then((oficinas) => {
        setOficinas(oficinas);
        if (oficinas.length === 0) {
          setServicios([]);
          setOpcionesTramite([]);
          setEstado("success");
          return;
        }
        return obtenerServiciosPorSede(oficinas[0].id, abort.signal);
      })
      .then((list) => {
        if (abort.signal.aborted || !list) return;
        setServicios(list);
        const opciones: TipoTramiteOption[] = [];
        list.forEach((s) => {
          s.subservices.forEach((sub) => {
            opciones.push({
              departmentId: s.id,
              subdepartmentId: sub.id,
              departmentName: s.name,
              subdepartmentName: sub.name,
              optionKey: `${s.id}-${sub.id}`,
            });
          });
        });
        setOpcionesTramite(opciones);
        setEstado("success");
      })
      .catch((err) => {
        if (abort.signal.aborted) return;
        setEstado("error");
        setErrorMensaje(getApiErrorMessage(err));
      });

    return () => abort.abort();
  }, [ciudadId, setOficinas]);

  const handleContinuar = () => {
    const opcion = opcionesTramite.find((o) => o.optionKey === optionKey);
    if (!opcion) {
      setErrorMensaje("Selecciona un tipo de trámite.");
      return;
    }
    setTipoTramite({
      departmentId: opcion.departmentId,
      subdepartmentId: opcion.subdepartmentId,
      departmentName: opcion.departmentName,
      subdepartmentName: opcion.subdepartmentName,
    });
    setPasoActual(3);
  };

  const puedeContinuar = Boolean(optionKey);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
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
            <Select
              value={optionKey}
              onValueChange={setOptionKey}
              disabled={estado === "loading"}
            >
              <SelectTrigger className="w-full border-primary/50 focus:border-primary">
                <SelectValue
                  placeholder={
                    estado === "loading"
                      ? "Cargando tipos de trámite..."
                      : "Selecciona el trámite"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {opcionesTramite.map((o) => (
                  <SelectItem key={o.optionKey} value={o.optionKey}>
                    {o.departmentName} → {o.subdepartmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              className="order-1 sm:order-2"
              disabled={!puedeContinuar}
              onClick={handleContinuar}
            >
              Continuar a sede, fecha y hora
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}