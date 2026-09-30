# Incremento — Seleção de cidade em combobox — Tarefas

Backlog derivado de [plans/city-combobox-plan.md](../plans/city-combobox-plan.md) e [specs/city-combobox-spec.md](../specs/city-combobox-spec.md).

- [x] **T-CB-01 — Transformar CityResults em combobox**
- **Tipo:** UI
- **Descrição:** Substituir a lista de botões por `<label>` + `<select>` nativo, mantendo as props.
- **Critérios de aceite:** Nome acessível "Resultados da busca"; placeholder "Selecione uma cidade" desabilitado e selecionado; opções "cidade, região, país"; texto de quantidade; escolha chama `onSelect` uma vez com a `City` correta; lista vazia não renderiza; não acessa API.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Requisitos relacionados:** FR-CB-01 a FR-CB-05, AC-CB-01 a AC-CB-04, NFR-CB-02, NFR-CB-03.

- [x] **T-CB-02 — Atualizar testes unitários e de integração**
- **Tipo:** Test
- **Descrição:** Adaptar `CityResults.test.tsx` e `App.test.tsx` ao combobox.
- **Critérios de aceite:** Cobre placeholder, homônimas, quantidade, foco por teclado, seleção única, lista vazia e concorrência via `option`; `pnpm test` passa.
- **Dependências:** T-CB-01.
- **Arquivos prováveis:** `tests/unit/CityResults.test.tsx`, `tests/unit/App.test.tsx`.
- **Requisitos relacionados:** AC-CB-01 a AC-CB-05.

- [x] **T-CB-03 — Atualizar E2E para o combobox**
- **Tipo:** Test
- **Descrição:** Trocar a seleção por botão por `selectOption` nos cenários Playwright.
- **Critérios de aceite:** Todos os cenários passam em `375x667`, `768x1024` e `1440x900` sem rolagem horizontal; `pnpm test:e2e` passa.
- **Dependências:** T-CB-01.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Requisitos relacionados:** AC-CB-03, AC-CB-05, NFR-CB-01.
- **Status:** concluída; 20 cenários E2E passam (chromium e mobile).

## Rastreabilidade

| Requisito | Implementação | Testes |
| --- | --- | --- |
| FR-CB-01 | T-CB-01 | T-CB-02, T-CB-03 |
| FR-CB-02 | T-CB-01 | T-CB-02 |
| FR-CB-03 | T-CB-01 | T-CB-02 |
| FR-CB-04 | T-CB-01 | T-CB-02, T-CB-03 |
| FR-CB-05 | T-CB-01 | T-CB-02 |

## Checklist

- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test`
- [x] `pnpm test:e2e`
