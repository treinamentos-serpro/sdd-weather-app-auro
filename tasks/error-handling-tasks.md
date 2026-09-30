# Incremento — Tratamento de falhas e retry — Tarefas

Backlog derivado de [plans/error-handling-plan.md](../plans/error-handling-plan.md) e [specs/error-handling-spec.md](../specs/error-handling-spec.md).

## Entrega 1 — Serviço

- [x] **T-ERR-01 — Corrigir classificação no `fetchJson`**
- **Tipo:** Data
- **Descrição:** Tratar sinal pré-abortado, timeout na leitura do corpo e 4xx/5xx.
- **Critérios de aceite:** AC-ERR-01, AC-ERR-02 e AC-ERR-03 atendidos; os comportamentos existentes (429, JSON inválido, rede, timeout) não mudam.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Requisitos relacionados:** FR-ERR-01, FR-ERR-02, FR-ERR-03.

## Entrega 2 — UI

- [x] **T-ERR-02 — Mensagens amigáveis**
- **Tipo:** UI
- **Descrição:** Atualizar o mapa de mensagens do `ErrorState`.
- **Critérios de aceite:** Textos idênticos à tabela de FR-ERR-04.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Requisitos relacionados:** FR-ERR-04, AC-ERR-04.

- [x] **T-ERR-03 — Foco após retry**
- **Tipo:** UI
- **Descrição:** Props `focusRetry` (`ErrorState`) e `focusOnMount` (`CityResults`); estado `retrying` no `App`.
- **Critérios de aceite:** AC-ERR-05, AC-ERR-06 e AC-ERR-07; uma busca normal não move o foco.
- **Dependências:** T-ERR-02.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/states/ErrorState.tsx`, `src/components/CityResults.tsx`.
- **Requisitos relacionados:** FR-ERR-05.

## Entrega 3 — Testes

- [x] **T-ERR-04 — Testes unitários de serviço e hook**
- **Tipo:** Test
- **Descrição:** Timeout no corpo, sinal pré-abortado, 404/503, rede offline; retry da busca offline; retry sem operação anterior.
- **Critérios de aceite:** `pnpm test` passa.
- **Dependências:** T-ERR-01.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`, `tests/unit/useWeather.test.ts`.
- **Requisitos relacionados:** AC-ERR-01, AC-ERR-02, AC-ERR-03, AC-ERR-05.

- [x] **T-ERR-05 — Testes de componentes e App**
- **Tipo:** Test
- **Descrição:** Mensagens novas; foco no botão e no combobox; fluxo de retry no `App`.
- **Critérios de aceite:** `pnpm test` passa.
- **Dependências:** T-ERR-02, T-ERR-03.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`, `tests/unit/App.test.tsx`.
- **Requisitos relacionados:** AC-ERR-04, AC-ERR-05, AC-ERR-07.

- [x] **T-ERR-06 — E2E offline**
- **Tipo:** Test
- **Descrição:** Busca e previsão com `route.abort('internetdisconnected')`, reconexão e retry por teclado.
- **Critérios de aceite:** Os cenários passam nos três viewports; o retry refaz apenas o endpoint que falhou.
- **Dependências:** T-ERR-03.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Requisitos relacionados:** AC-ERR-05, AC-ERR-06.
- **Status:** concluída; 20 cenários E2E passam (chromium e mobile).

## Rastreabilidade

| Requisito | Implementação | Testes |
| --- | --- | --- |
| FR-ERR-01 | T-ERR-01 | T-ERR-04 |
| FR-ERR-02 | T-ERR-01 | T-ERR-04 |
| FR-ERR-03 | T-ERR-01 | T-ERR-04 |
| FR-ERR-04 | T-ERR-02 | T-ERR-05 |
| FR-ERR-05 | T-ERR-03 | T-ERR-04, T-ERR-05, T-ERR-06 |

## Checklist

- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test`
- [x] `pnpm test:e2e`
