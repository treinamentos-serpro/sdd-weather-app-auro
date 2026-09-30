export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number; // Identificador retornado pelo geocoding.
  name: string; // Nome da cidade.
  latitude: number; // Latitude usada na consulta de forecast.
  longitude: number; // Longitude usada na consulta de forecast.
  country?: string; // Nome do país, quando disponível.
  countryCode?: string; // Código ISO do país, quando disponível.
  region?: string; // Estado ou região administrativa, quando disponível.
  timezone: string; // Fuso horário IANA da cidade.
}

export interface WeatherCondition {
  code: number; // Código WMO da condição meteorológica.
  label?: string; // Descrição da condição em pt-BR.
}

export interface CurrentWeather {
  measuredAt: string; // Data e hora da medição no fuso da cidade.
  temperatureCelsius: number; // Temperatura atual em Celsius.
  condition: WeatherCondition; // Condição meteorológica atual.
}

export interface ForecastDay {
  date: string; // Data local no formato ISO YYYY-MM-DD.
  temperatureMaxCelsius: number; // Temperatura máxima diária em Celsius.
  temperatureMinCelsius: number; // Temperatura mínima diária em Celsius.
  condition?: WeatherCondition; // Condição diária, quando disponível.
}

export interface WeatherData {
  city: City; // Cidade selecionada pelo usuário.
  current: CurrentWeather; // Condições meteorológicas atuais.
  daily: ForecastDay[]; // Previsão diária normalizada.
}

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface WeatherError {
  kind: 'invalid-input' | 'not-found' | 'timeout' | 'rate-limit' | 'network' | 'invalid-response';
  retryable: boolean; // Indica se a operação pode ser repetida.
  message: string; // Mensagem para apresentação ao usuário.
}
