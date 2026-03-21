
export type TramiteOption = {
  serviceName: string;
  subserviceName: string;
};

export const TRAMITES_PREDETERMINADOS: TramiteOption[] = [
  // Grupo 1
  { serviceName: "AFILIACIÓN Y SOLICITUD CRÉDITO", subserviceName: "AFILIACIÓN" },
  { serviceName: "AFILIACIÓN Y SOLICITUD CRÉDITO", subserviceName: "SOLICITUD CRÉDITO" },
  { serviceName: "AFILIACIÓN Y SOLICITUD CRÉDITO", subserviceName: "FERIA VIVIENDA" },
  // Grupo 2
  { serviceName: "RETIROS Y SERVICIOS CRÉDITO", subserviceName: "RETIROS" },
  { serviceName: "RETIROS Y SERVICIOS CRÉDITO", subserviceName: "CREDITO" },
  // Grupo 3
  { serviceName: "LEGALIZACIÓN", subserviceName: "LEGALIZACION DE CREDITO" },
  // Grupo 4
  { serviceName: "CANCELACIÓN HIPOTECA", subserviceName: "CANCELACIÓN HIPOTECA" },
  // Grupo 5
  { serviceName: "SEGUROS", subserviceName: "SEGUROS" },
  // Grupo 6
  { serviceName: "ACOMPAÑAMIENTO AL DEUDOR", subserviceName: "COBRANZAS" },
  // Grupo 7
  { serviceName: "CERTIFICACIONES, SALDOS Y FACTURA", subserviceName: "CERTIFICACIONES, SALDOS Y FACTURA" },
];

export function getTramitesAgrupados(): Record<string, TramiteOption[]> {
  return TRAMITES_PREDETERMINADOS.reduce((acc, tramite) => {
    if (!acc[tramite.serviceName]) {
      acc[tramite.serviceName] = [];
    }
    acc[tramite.serviceName].push(tramite);
    return acc;
  }, {} as Record<string, TramiteOption[]>);
}