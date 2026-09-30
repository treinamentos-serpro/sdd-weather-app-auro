import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CityResults from '../../src/components/CityResults';
import type { City } from '../../src/types/weather';

const cities: City[] = [
  {
    id: 1,
    name: 'São Paulo',
    latitude: -23.5,
    longitude: -46.6,
    country: 'Brasil',
    region: 'São Paulo',
    timezone: 'America/Sao_Paulo',
  },
  {
    id: 2,
    name: 'São Paulo',
    latitude: -15.6,
    longitude: -56.1,
    country: 'Brasil',
    region: 'Mato Grosso',
    timezone: 'America/Cuiaba',
  },
];

afterEach(() => cleanup());

describe('CityResults', () => {
  it('lists homonyms and only selects after explicit confirmation', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CityResults cities={cities} onSelect={onSelect} />);

    const combobox = screen.getByRole('combobox', { name: 'Resultados da busca' });
    const confirm = screen.getByRole('button', { name: 'Ver previsão' });
    expect(combobox).toHaveValue('');
    expect(confirm).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Selecione uma cidade' })).toBeDisabled();
    expect(
      screen.getByRole('option', { name: 'São Paulo, São Paulo, Brasil' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'São Paulo, Mato Grosso, Brasil' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 cidades encontradas');

    await user.tab();
    expect(combobox).toHaveFocus();
    await user.selectOptions(combobox, 'São Paulo, São Paulo, Brasil');
    await user.selectOptions(combobox, 'São Paulo, Mato Grosso, Brasil');
    expect(onSelect).not.toHaveBeenCalled();

    await user.tab();
    expect(confirm).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(cities[1]);
  });

  it('renders nothing without cities', () => {
    const { container } = render(<CityResults cities={[]} onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
