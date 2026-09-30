import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
  focusOnMount?: boolean;
}

export default function CityResults({ cities, onSelect, focusOnMount = false }: CityResultsProps) {
  const [selectedId, setSelectedId] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  const shouldFocusOnMount = useRef(focusOnMount);

  useEffect(() => {
    if (shouldFocusOnMount.current) {
      selectRef.current?.focus();
    }
  }, []);

  if (cities.length === 0) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const city = cities.find((item) => String(item.id) === selectedId);
    if (city) {
      onSelect(city);
    }
  };

  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4"
      onSubmit={handleSubmit}
    >
      <label className="text-sm font-medium text-white/80" htmlFor="city-results">
        Resultados da busca
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          id="city-results"
          onChange={(event) => setSelectedId(event.target.value)}
          ref={selectRef}
          value={selectedId}
        >
          <option className="bg-night-900 text-white" disabled value="">
            Selecione uma cidade
          </option>
          {cities.map((city) => (
            <option className="bg-night-900 text-white" key={city.id} value={city.id}>
              {formatCityLabel(city)}
            </option>
          ))}
        </select>
        <button
          className="rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!selectedId}
          type="submit"
        >
          Ver previsão
        </button>
      </div>
      <p className="text-xs text-white/60" role="status">
        {cities.length === 1 ? '1 cidade encontrada' : `${cities.length} cidades encontradas`}
      </p>
    </form>
  );
}

function formatCityLabel(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(', ');
}
