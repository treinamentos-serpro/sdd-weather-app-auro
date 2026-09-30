import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  timezone: string;
  unit: Unit;
}

export default function ForecastList({ days, timezone, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold" id="forecast-title">
          Próximos 5 dias
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day) => (
          <ForecastCard day={day} key={day.date} timezone={timezone} unit={unit} />
        ))}
      </div>
    </section>
  );
}
