import { getWeatherLabel } from '../lib/weatherCodes';
import type { City, WeatherData, WeatherError } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  readonly kind: WeatherError['kind'];
  readonly retryable: boolean;
  readonly failureState: 'empty' | 'error';

  constructor(
    kind: WeatherError['kind'],
    message: string,
    retryable: boolean,
    failureState: 'empty' | 'error' = 'error',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.retryable = retryable;
    this.failureState = failureState;
  }
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    country_code?: string;
    admin1?: string;
    timezone?: string;
  }>;
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

async function fetchJson<T>(url: string, externalSignal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const abortHandler = () => controller.abort();
  if (externalSignal?.aborted) {
    controller.abort();
  }
  externalSignal?.addEventListener('abort', abortHandler, { once: true });

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 429) {
        throw new WeatherServiceError('rate-limit', 'Limite de requisições atingido.', true);
      }

      if (response.status >= 500) {
        throw new WeatherServiceError('network', 'A API não está disponível.', true);
      }

      throw new WeatherServiceError('invalid-response', 'A API recusou a requisição.', false);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      if (controller.signal.aborted) {
        throw error;
      }
      throw new WeatherServiceError('invalid-response', 'A API retornou dados inválidos.', true);
    }
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }

    if (externalSignal?.aborted) {
      throw new WeatherServiceError('network', 'A consulta foi cancelada.', true);
    }

    if (controller.signal.aborted) {
      throw new WeatherServiceError('timeout', 'A consulta demorou mais de 10 segundos.', true);
    }

    throw new WeatherServiceError('network', 'Não foi possível conectar à API.', true);
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortHandler);
  }
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery || !/[\p{L}\p{N}]/u.test(normalizedQuery)) {
    return [];
  }

  const params = new URLSearchParams({
    name: normalizedQuery,
    count: '10',
    language: 'pt',
    format: 'json',
  });
  const response = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`, signal);

  return (response.results ?? [])
    .filter((result) => result.timezone)
    .map((result) => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      countryCode: result.country_code,
      region: result.admin1,
      timezone: result.timezone as string,
    }));
}

export async function getForecast(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    temperature_unit: 'celsius',
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params}`, signal);
  const current = response.current;
  const daily = response.daily;

  if (
    !response.timezone ||
    !current?.time ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.weather_code !== 'number' ||
    !daily?.time ||
    !daily.temperature_2m_max ||
    !daily.temperature_2m_min ||
    daily.time.length < 5 ||
    daily.temperature_2m_max.length < 5 ||
    daily.temperature_2m_min.length < 5
  ) {
    throw new WeatherServiceError(
      'invalid-response',
      'Dados meteorológicos insuficientes.',
      false,
      'empty',
    );
  }

  const days = daily.time.slice(0, 5).map((date, index) => {
    const maximum = daily.temperature_2m_max?.[index];
    const minimum = daily.temperature_2m_min?.[index];

    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof maximum !== 'number' ||
      !Number.isFinite(maximum) ||
      typeof minimum !== 'number' ||
      !Number.isFinite(minimum)
    ) {
      throw new WeatherServiceError(
        'invalid-response',
        'Dados meteorológicos insuficientes.',
        false,
        'empty',
      );
    }

    const code = daily.weather_code?.[index];

    return {
      date,
      temperatureMaxCelsius: maximum,
      temperatureMinCelsius: minimum,
      ...(typeof code === 'number' ? { condition: { code, label: getWeatherLabel(code) } } : {}),
    };
  });

  return {
    city: { ...city, timezone: response.timezone },
    current: {
      measuredAt: current.time,
      temperatureCelsius: current.temperature_2m,
      condition: {
        code: current.weather_code,
        label: getWeatherLabel(current.weather_code),
      },
    },
    daily: days,
  };
}
