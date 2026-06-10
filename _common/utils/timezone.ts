/**
 * Converts a local date + time string to a UTC Date object.
 * Uses the Intl API to correctly handle DST transitions.
 *
 * @param dateStr - 'YYYY-MM-DD'
 * @param timeStr - 'HH:mm'
 * @param timezone - IANA timezone string, e.g. 'Europe/Moscow'
 */
export function localToUtc(dateStr: string, timeStr: string, timezone: string): Date {
  // Estimate: treat the local time as if it were UTC
  const estimated = new Date(`${dateStr}T${timeStr}:00.000Z`);

  // Find what local date/time the estimated UTC moment corresponds to in the given timezone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(estimated)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const localAsUtcMs = Date.UTC(
    Number(parts['year']),
    Number(parts['month']) - 1,
    Number(parts['day']),
    Number(parts['hour']),
    Number(parts['minute']),
    Number(parts['second']),
  );

  // offset = local (treated as UTC) - actual UTC
  const offset = localAsUtcMs - estimated.getTime();

  return new Date(estimated.getTime() - offset);
}

/**
 * Returns the local date string ('YYYY-MM-DD') and time in minutes
 * for a UTC Date in the given timezone.
 */
export function utcToLocal(utcDate: Date, timezone: string): { dateStr: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .formatToParts(utcDate)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    dateStr: `${parts['year']}-${parts['month']}-${parts['day']}`,
    minutes: Number(parts['hour']) * 60 + Number(parts['minute']),
  };
}
