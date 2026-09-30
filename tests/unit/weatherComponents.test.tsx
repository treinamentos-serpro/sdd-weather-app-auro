import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastCard from '../../src/components/ForecastCard';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';

afterEach(() => cleanup());

describe('weather components', () => {
  it('renders current weather data', () => {
    render(<CurrentWeather data={mockWeatherData} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    expect(screen.getByText('22°C')).toBeVisible();
  });

  it('renders available city location details', () => {
    const data = {
      ...mockWeatherData,
      city: { ...mockWeatherData.city, region: 'São Paulo', country: 'Brasil' },
    };

    render(<CurrentWeather data={data} unit="celsius" />);

    expect(screen.getByText('São Paulo, Brasil')).toBeVisible();
  });

  it('shows an insufficient-data state when current weather is incomplete', () => {
    const data = {
      ...mockWeatherData,
      current: { ...mockWeatherData.current, temperatureCelsius: Number.NaN },
    };

    render(<CurrentWeather data={data} unit="celsius" />);

    expect(screen.getByText('Dados meteorológicos insuficientes.')).toBeVisible();
    expect(screen.queryByText('22°C')).not.toBeInTheDocument();
  });

  it('renders exactly five forecast cards', () => {
    render(
      <ForecastList
        days={mockWeatherData.daily}
        timezone={mockWeatherData.city.timezone}
        unit="celsius"
      />,
    );

    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('30/09')).toBeVisible();
  });

  it('renders one forecast card with its date and temperature range', () => {
    render(
      <ForecastCard
        day={mockWeatherData.daily[0]}
        timezone={mockWeatherData.city.timezone}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('article', { name: '30/09' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: '30/09' })).toBeVisible();
    expect(screen.getByText(/25°C/).closest('p')).toHaveTextContent('Máxima 25°C / Mínima 17°C');
  });

  it('labels a missing daily condition as unavailable', () => {
    const day = { ...mockWeatherData.daily[0], condition: undefined };

    render(<ForecastCard day={day} timezone="America/Sao_Paulo" unit="celsius" />);

    expect(screen.getByText('Condição indisponível')).toBeVisible();
  });

  it('shows insufficient data instead of invalid forecast values', () => {
    const day = { ...mockWeatherData.daily[0], temperatureMaxCelsius: Number.NaN };

    render(<ForecastCard day={day} timezone="America/Sao_Paulo" unit="celsius" />);

    expect(screen.getByText('Dados meteorológicos insuficientes.')).toBeVisible();
  });
});
