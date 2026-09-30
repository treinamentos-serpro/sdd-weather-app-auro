import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    country: 'Brasil',
    countryCode: 'BR',
    region: 'São Paulo',
    timezone: 'America/Sao_Paulo',
  },
  current: {
    measuredAt: '2026-09-30T12:00:00-03:00',
    temperatureCelsius: 22,
    condition: {
      code: 2,
      label: 'Parcialmente nublado',
    },
  },
  daily: [
    {
      date: '2026-09-30',
      temperatureMaxCelsius: 25,
      temperatureMinCelsius: 17,
      condition: {
        code: 2,
        label: 'Parcialmente nublado',
      },
    },
    {
      date: '2026-10-01',
      temperatureMaxCelsius: 23,
      temperatureMinCelsius: 16,
      condition: {
        code: 61,
        label: 'Chuva fraca',
      },
    },
    {
      date: '2026-10-02',
      temperatureMaxCelsius: 26,
      temperatureMinCelsius: 18,
      condition: {
        code: 1,
        label: 'Predominantemente limpo',
      },
    },
    {
      date: '2026-10-03',
      temperatureMaxCelsius: 27,
      temperatureMinCelsius: 19,
      condition: {
        code: 0,
        label: 'Céu limpo',
      },
    },
    {
      date: '2026-10-04',
      temperatureMaxCelsius: 24,
      temperatureMinCelsius: 18,
      condition: {
        code: 3,
        label: 'Nublado',
      },
    },
  ],
};
