/**
 * Determina si una fecha está permitida para agendamiento de acuerdo con las reglas de negocio.
 * 
 * Reglas de atención nacional:
 * - Domingos: No se atiende.
 * - Sábados: Solo se atiende el 1º y 3º sábado de cada mes (bloqueando el 2º, 4º y 5º sábado).
 * - Lunes a Viernes: Días normales de atención.
 * 
 * @param dateStr Fecha en formato 'YYYY-MM-DD'
 * @param weekDayStr Nombre del día opcional para verificación rápida (ej: 'DOMINGO')
 */
export function isAllowedScheduleDate(dateStr: string, weekDayStr?: string): boolean {
  if (!dateStr) return false;

  if (weekDayStr) {
    const normalized = weekDayStr.trim().toUpperCase();
    if (normalized === "DOMINGO" || normalized === "SUNDAY") {
      return false;
    }
  }

  const parts = dateStr.split("-");
  if (parts.length !== 3) return true;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return true;

  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado

  if (dayOfWeek === 0) {
    return false;
  }

  if (dayOfWeek === 6) {
    const saturdayIndex = Math.floor((day - 1) / 7) + 1;
    if (saturdayIndex !== 1 && saturdayIndex !== 3) {
      return false;
    }
  }

  return true;
}
