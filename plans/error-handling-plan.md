# Incremento — Tratamento de falhas e retry — Plano Técnico

> **Consome:** [specs/error-handling-spec.md](../specs/error-handling-spec.md). **Base:** [weather-app-plan.md](weather-app-plan.md) (Error Handling).

## Architecture

| Arquivo | Mudança | Requisito |
| --- | --- | --- |
| `src/services/weatherService.ts` | Em `fetchJson`: abortar imediatamente se o sinal externo já vier abortado; relançar o `AbortError` da leitura do corpo para o `catch` externo; classificar `5xx` como `network` e os demais `4xx` como `invalid-response`. | FR-ERR-01, 02, 03 |
| `src/components/states/ErrorState.tsx` | Atualizar o mapa de mensagens; nova prop `focusRetry` que foca o botão ao montar. | FR-ERR-04, 05 |
| `src/components/CityResults.tsx` | Nova prop `focusOnMount` que foca o `<select>` ao montar. | FR-ERR-05 |
| `src/App.tsx` | Estado `retrying` (`true` ao clicar em retry, `false` em nova busca ou seleção), repassado a `ErrorState` e `CityResults`. | FR-ERR-05 |

`useWeather` não muda: `lastAction` já refaz somente a operação que falhou. O foco no título da cidade já existe (`CurrentWeather`).

## Decisões técnicas

| Decisão | Escolha | Trade-off |
| --- | --- | --- |
| Timeout no corpo | No `catch` do `json()`, relançar o erro quando `controller.signal.aborted`. | Mantém um único ponto de classificação (o `catch` externo). |
| Sinal pré-abortado | `if (externalSignal?.aborted) controller.abort()` antes do `fetch`. | O `fetch` rejeita na hora; o hook já ignora requisições canceladas. |
| 4xx | `invalid-response`, sem retry. | Repetir a mesma requisição não resolveria; a mensagem deixa de sugerir problema de conexão. |
| Fonte das mensagens | Mapa do `ErrorState`. | Os textos do `WeatherServiceError` continuam técnicos e internos. |
| Foco pós-retry | Flag `retrying` no `App`, sem mudar o hook. | Estado de UI fica na UI; o foco só ocorre após o clique explícito. |

## Testing Strategy

- **Serviço:** timeout na leitura do corpo; sinal pré-abortado; 404 × 503; falha de rede (`TypeError('Failed to fetch')`).
- **Hook:** busca offline → retry refaz só o geocoding; `retry()` sem operação anterior não chama serviços.
- **Componentes:** mensagens novas no `ErrorState`; foco no botão com `focusRetry`; foco no combobox com `focusOnMount`.
- **App:** retry da busca foca o combobox; falha repetida foca o novo botão.
- **E2E:** `route.abort('internetdisconnected')` na busca e na previsão; reconectar e usar o retry; conferir o foco.

## Risks

| Risco | Mitigação |
| --- | --- |
| Testes com textos exatos quebram | Atualizá-los no mesmo incremento; os E2E usam correspondência parcial. |
| Foco inesperado | Só ocorre após o retry explícito; a flag é limpa em nova busca ou seleção. |
