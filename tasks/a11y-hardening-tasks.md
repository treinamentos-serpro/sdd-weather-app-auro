# Incremento — Hardening de acessibilidade — Tarefas

Backlog derivado de [plans/a11y-hardening-plan.md](../plans/a11y-hardening-plan.md) e [specs/a11y-hardening-spec.md](../specs/a11y-hardening-spec.md).

## Entrega 1 — Contraste e foco

- [x] **T-A11Y-01 — Ajustar contraste dos controles primários**
- **Tipo:** UI
- **Descrição:** Adicionar `accent-700` ao tema; usar `bg-accent-600 hover:bg-accent-700` no "Buscar" e `aria-pressed:bg-accent-600` nas unidades.
- **Critérios de aceite:** Texto branco ≥ 4,5:1 em repouso, hover e selecionado; sem regressão de layout.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `tailwind.config.js`, `src/components/SearchBar.tsx`, `src/components/UnitToggle.tsx`.
- **Requisitos relacionados:** FR-A11Y-01, AC-A11Y-01.

- [x] **T-A11Y-02 — Padronizar o indicador de foco**
- **Tipo:** UI
- **Descrição:** Trocar `focus:ring-*` por `focus-visible:ring-*` em todos os controles; usar `ring-accent-400` sólido no input de busca.
- **Critérios de aceite:** Foco ≥ 3:1 contra o fundo adjacente; anel visível no `Tab` e ausente no clique do mouse.
- **Dependências:** T-A11Y-01.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/UnitToggle.tsx`, `src/components/CityResults.tsx`, `src/components/states/ErrorState.tsx`.
- **Requisitos relacionados:** FR-A11Y-06, AC-A11Y-06.

## Entrega 2 — Seleção de cidade

- [x] **T-A11Y-03 — Confirmação explícita no combobox**
- **Tipo:** UI
- **Descrição:** Envolver o `<select>` em `<form>`; tornar o `select` controlado (`selectedId`); adicionar o botão submit "Ver previsão", desabilitado sem escolha; contagem com `role="status"`.
- **Critérios de aceite:** As setas/o `change` não chamam `onSelect`; o submit chama `onSelect` uma vez com a `City` correta; nova busca reseta a escolha.
- **Dependências:** T-A11Y-02.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Requisitos relacionados:** FR-A11Y-02, FR-A11Y-04, AC-A11Y-02, AC-A11Y-04.

## Entrega 3 — Anúncios e semântica

- [x] **T-A11Y-04 — Anunciar vazio/validação e associar ao input**
- **Tipo:** UI
- **Descrição:** `EmptyState` com `role="status"` e prop `id`; `SearchBar` com props `invalid`/`errorId` (`aria-invalid`, `aria-describedby`); `App` repassa os valores quando `searchStatus === 'empty'`.
- **Critérios de aceite:** A mensagem é anunciada; o input referencia a mensagem; os atributos somem após uma nova busca válida.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`, `src/components/SearchBar.tsx`, `src/App.tsx`.
- **Requisitos relacionados:** FR-A11Y-03, AC-A11Y-03.

- [x] **T-A11Y-05 — Focar o título ao carregar o clima**
- **Tipo:** UI
- **Descrição:** Remover `aria-live` da seção de clima no `App`; no `CurrentWeather`, `h2` com `tabIndex={-1}`, `ref` e `useEffect` focando ao mudar `data.city.id`.
- **Critérios de aceite:** Após o sucesso, o foco está no título da cidade; alternar a unidade não move o foco nem relê a seção.
- **Dependências:** T-A11Y-03.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/CurrentWeather.tsx`.
- **Requisitos relacionados:** FR-A11Y-05, AC-A11Y-05.

- [x] **T-A11Y-06 — Semântica dos cards de previsão**
- **Tipo:** UI
- **Descrição:** Data em `<h3 id>`; `article aria-labelledby`; prefixos `sr-only` "Máxima"/"Mínima".
- **Critérios de aceite:** Cada `article` tem nome igual à data; o visual não muda.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.
- **Requisitos relacionados:** FR-A11Y-07, AC-A11Y-07.

- [x] **T-A11Y-07 — Nomes das unidades e limpeza de ARIA redundante**
- **Tipo:** UI
- **Descrição:** `aria-label` "Celsius"/"Fahrenheit"; remover `aria-live` de `LoadingState` e `ErrorState`.
- **Critérios de aceite:** Os nomes acessíveis correspondem à spec; os roles `status`/`alert` são mantidos.
- **Dependências:** T-A11Y-01.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`.
- **Requisitos relacionados:** FR-A11Y-08, AC-A11Y-08.

## Entrega 4 — Testes e validação

- [x] **T-A11Y-08 — Atualizar e ampliar testes unitários**
- **Tipo:** Test
- **Descrição:** Ajustar `CityResults`, `App`, `UnitToggle`, `states`, `ForecastCard`/`ForecastList` conforme a tabela de impacto do plano.
- **Critérios de aceite:** Cobre AC-A11Y-02 a AC-A11Y-08; `pnpm test` passa.
- **Dependências:** T-A11Y-03 a T-A11Y-07.
- **Arquivos prováveis:** `tests/unit/*.test.tsx`.
- **Requisitos relacionados:** AC-A11Y-02 a AC-A11Y-08.

- [x] **T-A11Y-09 — Atualizar E2E e validar navegação por teclado**
- **Tipo:** Test
- **Descrição:** Filtrar `status` pelo texto; fluxo selecionar + "Ver previsão"; nomes novos das unidades; cenário só por teclado (Tab/setas/Enter).
- **Critérios de aceite:** Os cenários passam nos três viewports; as setas no combobox não disparam forecast; `pnpm test:e2e` passa.
- **Dependências:** T-A11Y-08.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Requisitos relacionados:** AC-A11Y-02, AC-A11Y-05, AC-A11Y-06, NFR-A11Y-01.
- **Status:** concluída; 20 cenários E2E passam (chromium e mobile).

## Rastreabilidade

| Requisito | Implementação | Testes |
| --- | --- | --- |
| FR-A11Y-01 | T-A11Y-01 | T-A11Y-08 (classes), validação manual de contraste |
| FR-A11Y-02 | T-A11Y-03 | T-A11Y-08, T-A11Y-09 |
| FR-A11Y-03 | T-A11Y-04 | T-A11Y-08 |
| FR-A11Y-04 | T-A11Y-03 | T-A11Y-08 |
| FR-A11Y-05 | T-A11Y-05 | T-A11Y-08, T-A11Y-09 |
| FR-A11Y-06 | T-A11Y-02 | T-A11Y-09, validação manual |
| FR-A11Y-07 | T-A11Y-06 | T-A11Y-08 |
| FR-A11Y-08 | T-A11Y-07 | T-A11Y-08, T-A11Y-09 |

## Ordem

```text
T-A11Y-01 → T-A11Y-02 → T-A11Y-03 → T-A11Y-05
T-A11Y-01 → T-A11Y-07
T-A11Y-04, T-A11Y-06 (independentes)
            └→ T-A11Y-08 → T-A11Y-09
```

## Checklist

- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test`
- [x] `pnpm test:e2e`
