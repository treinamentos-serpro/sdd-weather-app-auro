import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  errorId?: string;
}

export default function SearchBar({
  onSearch,
  disabled = false,
  invalid = false,
  errorId,
}: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = city.trim();

    if (disabled) {
      return;
    }

    onSearch(normalizedCity);
  }

  return (
    <form
      aria-label="Buscar clima por cidade"
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex-1">
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          aria-describedby={invalid ? errorId : undefined}
          aria-invalid={invalid || undefined}
          className="w-full rounded-xl border border-white/10 bg-night-800/80 px-4 py-3 text-white outline-none placeholder:text-white/50 focus-visible:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
          type="search"
          value={city}
        />
      </div>
      <button
        className="rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
