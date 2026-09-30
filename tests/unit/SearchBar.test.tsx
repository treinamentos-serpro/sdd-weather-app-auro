import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(() => cleanup());

describe('SearchBar', () => {
  it('submits empty and symbol-only input for hook validation, and trims valid input', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledWith('');
    onSearch.mockClear();
    await user.type(screen.getByLabelText('Cidade'), '!!!');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledWith('!!!');
    onSearch.mockClear();
    await user.clear(screen.getByLabelText('Cidade'));
    await user.type(screen.getByLabelText('Cidade'), '  Lisboa  ');
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });

  it('marks the field invalid and links it to the feedback message', () => {
    render(
      <>
        <SearchBar errorId="feedback" invalid onSearch={vi.fn()} />
        <p id="feedback">Nenhuma cidade foi encontrada.</p>
      </>,
    );

    const input = screen.getByLabelText('Cidade');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Nenhuma cidade foi encontrada.');
  });
});
