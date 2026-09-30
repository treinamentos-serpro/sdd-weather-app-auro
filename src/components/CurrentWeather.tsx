import { useEffect, useRef } from 'react';
import { formatMeasuredTime } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import type { Unit, WeatherData } from '../types/weather';
import EmptyState from './states/EmptyState';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: Unit;
}

export default function CurrentWeather({ data, unit }: CurrentWeatherProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Mounted only on weather success, so focusing on mount announces each new load.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const location = [data.city.region, data.city.country].filter(Boolean).join(', ');
  const hasRequiredData =
    Boolean(data.city.name.trim()) &&
    Boolean(data.city.timezone) &&
    Boolean(data.current.measuredAt) &&
    Number.isFinite(data.current.temperatureCelsius) &&
    Number.isFinite(data.current.condition?.code);

  if (!hasRequiredData) {
    return <EmptyState message="Dados meteorológicos insuficientes." />;
  }

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
    >
      <p className="text-sm text-white/60">Clima atual</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-2xl font-semibold focus:outline-none"
            id="current-weather-title"
            ref={headingRef}
            tabIndex={-1}
          >
            {data.city.name}
          </h2>
          {location && <p className="mt-1 text-sm text-white/60">{location}</p>}
          <p className="mt-1 text-white/65">
            {data.current.condition.label ?? 'Condição indisponível'}
          </p>
          <p className="mt-2 text-sm text-white/50">
            Atualizado às {formatMeasuredTime(data.current.measuredAt, data.city.timezone)}
          </p>
        </div>
        <p className="text-5xl font-semibold text-sun">
          {formatTemperature(data.current.temperatureCelsius, unit)}
        </p>
      </div>
    </section>
  );
}
