import { useId } from 'react';
import { formatForecastDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import type { ForecastDay, Unit } from '../types/weather';
import EmptyState from './states/EmptyState';

interface ForecastCardProps {
  day: ForecastDay;
  timezone: string;
  unit: Unit;
}

export default function ForecastCard({ day, timezone, unit }: ForecastCardProps) {
  const titleId = useId();
  const hasRequiredData =
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    Number.isFinite(day.temperatureMaxCelsius) &&
    Number.isFinite(day.temperatureMinCelsius);

  if (!hasRequiredData) {
    return <EmptyState message="Dados meteorológicos insuficientes." />;
  }

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md"
    >
      <h3 className="text-sm font-normal text-white/60" id={titleId}>
        {formatForecastDate(day.date, timezone)}
      </h3>
      <p className="mt-4 text-lg font-semibold">
        {day.condition?.label ?? 'Condição indisponível'}
      </p>
      <p className="mt-4 text-white/80">
        <span className="sr-only">Máxima </span>
        {formatTemperature(day.temperatureMaxCelsius, unit)} /{' '}
        <span className="sr-only">Mínima </span>
        {formatTemperature(day.temperatureMinCelsius, unit)}
      </p>
    </article>
  );
}
