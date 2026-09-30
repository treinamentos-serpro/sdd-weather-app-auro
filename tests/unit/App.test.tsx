import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getForecast, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getForecast: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

describe('App', () => {
  afterEach(() => cleanup());
  beforeEach(() => vi.clearAllMocks());

  it('renders the weather search screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Previsão do tempo' })).toBeVisible();
    expect(screen.getByRole('search')).toBeVisible();
  });

  it('connects search, selection, forecast, and unit presentation', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getForecast).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Resultados da busca' }),
      'São Paulo, São Paulo, Brasil',
    );
    expect(getForecast).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Ver previsão' }));

    expect(await screen.findByText('22°C')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(getForecast).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('72°F')).toBeVisible();
    expect(getForecast).toHaveBeenCalledTimes(1);

    await user.clear(screen.getByLabelText('Cidade'));
    await user.type(screen.getByLabelText('Cidade'), '!!!');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByText('Informe o nome de uma cidade.')).toBeVisible();
    expect(screen.getByLabelText('Cidade')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Cidade')).toHaveAccessibleDescription(
      'Informe o nome de uma cidade.',
    );
    expect(screen.queryByText('72°F')).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(1);
  });

  it('retries an offline search and moves focus to the retry result', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Verifique sua internet e tente novamente.',
    );
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).not.toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus(),
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Resultados da busca' })).toHaveFocus(),
    );
    expect(searchCities).toHaveBeenCalledTimes(3);
    expect(getForecast).not.toHaveBeenCalled();
  });

  it('allows a newer search while the previous search is pending', async () => {
    const user = userEvent.setup();
    const olderCity: City = {
      ...mockWeatherData.city,
      id: 1,
      name: 'Porto',
      country: 'Portugal',
      region: 'Porto',
    };
    const newerCity: City = {
      ...mockWeatherData.city,
      id: 2,
      name: 'Lisboa',
      country: 'Portugal',
      region: 'Lisboa',
    };
    let resolveOlderSearch!: (cities: City[]) => void;
    const olderSearch = new Promise<City[]>((resolve) => {
      resolveOlderSearch = resolve;
    });
    vi.mocked(searchCities).mockReturnValueOnce(olderSearch).mockResolvedValueOnce([newerCity]);
    render(<App />);

    const cityInput = screen.getByLabelText('Cidade');
    await user.type(cityInput, 'Porto');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(cityInput).not.toBeDisabled();

    await user.clear(cityInput);
    await user.type(cityInput, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(
      await screen.findByRole('option', { name: 'Lisboa, Lisboa, Portugal' }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveOlderSearch([olderCity]);
    });

    expect(screen.getByRole('option', { name: 'Lisboa, Lisboa, Portugal' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Porto, Porto, Portugal' }),
    ).not.toBeInTheDocument();
  });
});
