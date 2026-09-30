import { useEffect, useRef } from 'react';
import type { WeatherError } from '../../types/weather';

interface ErrorStateProps {
  error: WeatherError;
  onRetry: () => void;
  focusRetry?: boolean;
}

const errorMessages: Record<WeatherError['kind'], string> = {
  'invalid-input': 'Informe o nome de uma cidade válida.',
  'not-found': 'Nenhuma cidade foi encontrada.',
  timeout: 'A consulta demorou mais de 10 segundos. Verifique sua conexão e tente novamente.',
  'rate-limit': 'Limite de requisições atingido. Tente novamente em instantes.',
  network:
    'Não foi possível conectar ao serviço de clima. Verifique sua internet e tente novamente.',
  'invalid-response': 'O serviço retornou dados inválidos. Tente novamente em instantes.',
};

export default function ErrorState({ error, onRetry, focusRetry = false }: ErrorStateProps) {
  const retryRef = useRef<HTMLButtonElement>(null);
  const shouldFocusOnMount = useRef(focusRetry);

  useEffect(() => {
    if (shouldFocusOnMount.current) {
      retryRef.current?.focus();
    }
  }, []);

  return (
    <div
      className="rounded-xl border border-red-300/20 bg-red-400/10 p-4 text-red-100"
      role="alert"
    >
      <p>{errorMessages[error.kind]}</p>
      {error.retryable && (
        <button
          className="mt-3 rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          onClick={onRetry}
          ref={retryRef}
          type="button"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
