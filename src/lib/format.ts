export function formatForecastDate(date: string, timezone: string): string {
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  const anchor = Date.UTC(Number(year), Number(month) - 1, Number(day), 12);
  const requestedDate = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const timezoneDateParts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(anchor);
  const displayedDate = Date.UTC(
    Number(timezoneDateParts.find((part) => part.type === 'year')?.value),
    Number(timezoneDateParts.find((part) => part.type === 'month')?.value) - 1,
    Number(timezoneDateParts.find((part) => part.type === 'day')?.value),
  );
  const adjustedDate = new Date(anchor - (displayedDate - requestedDate));

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
  }).format(adjustedDate);
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const [year, month, day] = date.split('-').map(Number);
  const dateAtNoonUtc = new Date(Date.UTC(year, month - 1, day, 12));

  if (Number.isNaN(dateAtNoonUtc.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
  }).format(dateAtNoonUtc);
}

export function getShortDate(date: string, timezone = 'UTC'): string {
  return formatForecastDate(date, timezone);
}

export function formatMeasuredTime(measuredAt: string, timezone: string): string {
  const date = new Date(measuredAt);

  if (Number.isNaN(date.getTime())) {
    return measuredAt;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}
