import { useRef, useState } from 'react';
import { getForecast, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData, WeatherError, WeatherStatus } from '../types/weather';

type LastAction = { type: 'search'; query: string } | { type: 'forecast'; city: City };

interface UseWeatherResult {
  query: string;
  cityResults: City[];
  selectedCity: City | null;
  data: WeatherData | null;
  searchStatus: WeatherStatus;
  weatherStatus: WeatherStatus;
  searchError: WeatherError | null;
  weatherError: WeatherError | null;
  searchCity: (query: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toWeatherError(error: unknown): WeatherError {
  if (error instanceof WeatherServiceError) {
    return {
      kind: error.kind,
      retryable: error.retryable,
      message: error.message,
    };
  }

  return {
    kind: 'network',
    retryable: true,
    message: 'Não foi possível consultar o serviço de clima.',
  };
}

export function useWeather(): UseWeatherResult {
  const [query, setQuery] = useState('');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [searchStatus, setSearchStatus] = useState<WeatherStatus>('idle');
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('idle');
  const [searchError, setSearchError] = useState<WeatherError | null>(null);
  const [weatherError, setWeatherError] = useState<WeatherError | null>(null);
  const searchRequestId = useRef(0);
  const weatherRequestId = useRef(0);
  const searchController = useRef<AbortController | null>(null);
  const weatherController = useRef<AbortController | null>(null);
  const lastAction = useRef<LastAction | null>(null);

  async function searchCity(value: string) {
    const normalizedQuery = value.trim();
    setQuery(value);
    searchController.current?.abort();
    searchController.current = null;
    const requestId = ++searchRequestId.current;
    weatherController.current?.abort();
    weatherController.current = null;
    ++weatherRequestId.current;
    setCityResults([]);
    setSelectedCity(null);
    setData(null);
    setWeatherStatus('idle');
    setWeatherError(null);
    setSearchError(null);

    if (!normalizedQuery || !/[\p{L}\p{N}]/u.test(normalizedQuery)) {
      setSearchStatus('empty');
      lastAction.current = null;
      setSearchError({
        kind: 'invalid-input',
        retryable: false,
        message: 'Informe o nome de uma cidade.',
      });
      return;
    }

    const controller = new AbortController();
    searchController.current = controller;
    lastAction.current = { type: 'search', query: normalizedQuery };
    setSearchStatus('loading');
    setSearchError(null);

    try {
      const results = await searchCities(normalizedQuery, controller.signal);

      if (requestId !== searchRequestId.current) {
        return;
      }

      setCityResults(results);
      setSearchStatus(results.length > 0 ? 'success' : 'empty');
      if (results.length === 0) {
        setSearchError({
          kind: 'not-found',
          retryable: false,
          message: 'Nenhuma cidade foi encontrada.',
        });
      }
    } catch (error) {
      if (requestId !== searchRequestId.current || controller.signal.aborted) {
        return;
      }

      setSearchStatus('error');
      setSearchError(toWeatherError(error));
    }
  }

  async function selectCity(city: City) {
    weatherController.current?.abort();
    const controller = new AbortController();
    weatherController.current = controller;
    const requestId = ++weatherRequestId.current;
    lastAction.current = { type: 'forecast', city };
    setSelectedCity(city);
    setData(null);
    setWeatherStatus('loading');
    setWeatherError(null);

    try {
      const weather = await getForecast(city, controller.signal);

      if (requestId !== weatherRequestId.current) {
        return;
      }

      setData(weather);
      setWeatherStatus('success');
    } catch (error) {
      if (requestId !== weatherRequestId.current || controller.signal.aborted) {
        return;
      }

      if (error instanceof WeatherServiceError && error.failureState === 'empty') {
        setWeatherStatus('empty');
        return;
      }

      setWeatherStatus('error');
      setWeatherError(toWeatherError(error));
    }
  }

  async function retry() {
    const action = lastAction.current;

    if (!action) {
      return;
    }

    if (action.type === 'search') {
      await searchCity(action.query);
      return;
    }

    await selectCity(action.city);
  }

  return {
    query,
    cityResults,
    selectedCity,
    data,
    searchStatus,
    weatherStatus,
    searchError,
    weatherError,
    searchCity,
    selectCity,
    retry,
  };
}
