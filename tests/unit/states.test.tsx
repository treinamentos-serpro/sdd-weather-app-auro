import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

afterEach(() => cleanup());

describe('weather states', () => {
  it('renders loading accessibly', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('renders empty and error retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<EmptyState message="Cidade não encontrada" />);
    expect(screen.getByRole('status')).toHaveTextContent('Cidade não encontrada');

    render(
      <>
        <ErrorState
          error={{ kind: 'network', message: 'Falha de rede', retryable: true }}
          onRetry={onRetry}
        />
        <ErrorState
          error={{ kind: 'invalid-response', message: 'Resposta inválida', retryable: false }}
          onRetry={onRetry}
        />
      </>,
    );
    const alerts = screen.getAllByRole('alert');
    expect(
      within(alerts[0]).getByText(
        'Não foi possível conectar ao serviço de clima. Verifique sua internet e tente novamente.',
      ),
    ).toBeVisible();
    expect(within(alerts[0]).getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    expect(
      within(alerts[1]).getByText(
        'O serviço retornou dados inválidos. Tente novamente em instantes.',
      ),
    ).toBeVisible();
    expect(within(alerts[1]).queryByRole('button')).not.toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });
    await user.tab();
    expect(retryButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('keeps invalid input, no results, and insufficient data distinguishable', () => {
    render(
      <>
        <EmptyState message="Informe o nome de uma cidade." />
        <EmptyState message="Nenhuma cidade foi encontrada." />
        <EmptyState message="Dados meteorológicos insuficientes." />
      </>,
    );

    expect(screen.getByText('Informe o nome de uma cidade.')).toBeVisible();
    expect(screen.getByText('Nenhuma cidade foi encontrada.')).toBeVisible();
    expect(screen.getByText('Dados meteorológicos insuficientes.')).toBeVisible();
  });

  it('focuses the retry button on mount only when requested', () => {
    const error = { kind: 'timeout' as const, message: 'Timeout', retryable: true };
    const { unmount } = render(<ErrorState error={error} onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).not.toHaveFocus();
    unmount();

    render(<ErrorState error={error} focusRetry onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A consulta demorou mais de 10 segundos. Verifique sua conexão e tente novamente.',
    );
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
  });
});
