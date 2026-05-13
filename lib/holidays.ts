const cache = new Map<number, Set<string>>();

export async function getColombianHolidays(
  year: number,
  signal?: AbortSignal
): Promise<Set<string>> {
  if (cache.has(year)) return cache.get(year)!;

  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/CO`,
      { signal }
    );
    if (!res.ok) return new Set();

    const data: { date: string }[] = await res.json();
    const holidays = new Set(data.map((h) => h.date));
    cache.set(year, holidays);
    return holidays;
  } catch {
    return new Set();
  }
}
