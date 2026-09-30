import { useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

const SEARCH_FEEDBACK_ID = 'search-feedback';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [retrying, setRetrying] = useState(false);
  const {
    cityResults,
    data,
    retry,
    searchCity,
    searchError,
    searchStatus,
    selectCity,
    weatherError,
    weatherStatus,
  } = useWeather();

  const handleRetry = () => {
    setRetrying(true);
    void retry();
  };

  return (
    <main className="min-h-screen bg-night-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent-400">
              Weather App
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Previsão do tempo</h1>
            <p className="mt-2 text-white/65">
              Consulte as condições de uma cidade e planeje os próximos dias.
            </p>
          </div>
          <UnitToggle onChange={setUnit} unit={unit} />
        </header>

        <SearchBar
          errorId={SEARCH_FEEDBACK_ID}
          invalid={searchStatus === 'empty' && Boolean(searchError)}
          onSearch={(city) => {
            setRetrying(false);
            void searchCity(city);
          }}
        />

        {searchStatus === 'loading' && <LoadingState />}
        {searchStatus === 'error' && searchError && (
          <ErrorState error={searchError} focusRetry={retrying} onRetry={handleRetry} />
        )}
        {searchStatus === 'empty' && searchError && (
          <EmptyState id={SEARCH_FEEDBACK_ID} message={searchError.message} />
        )}
        {searchStatus === 'success' && (
          <CityResults
            cities={cityResults}
            focusOnMount={retrying}
            key={cityResults.map((city) => city.id).join('-')}
            onSelect={(city) => {
              setRetrying(false);
              void selectCity(city);
            }}
          />
        )}

        {weatherStatus === 'loading' && <LoadingState />}
        {weatherStatus === 'error' && weatherError && (
          <ErrorState error={weatherError} focusRetry={retrying} onRetry={handleRetry} />
        )}
        {weatherStatus === 'empty' && (
          <EmptyState message="Não há dados suficientes para esta cidade." />
        )}
        {weatherStatus === 'success' && data && (
          <section className="flex flex-col gap-6">
            <CurrentWeather data={data} unit={unit} />
            <ForecastList days={data.daily} timezone={data.city.timezone} unit={unit} />
          </section>
        )}
      </div>
    </main>
  );
}
