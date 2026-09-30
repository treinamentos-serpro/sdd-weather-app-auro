# Incremento — Hardening de acessibilidade — Plano Técnico

> **Consome:** [specs/a11y-hardening-spec.md](../specs/a11y-hardening-spec.md). **Base:** [weather-app-plan.md](weather-app-plan.md), [city-combobox-plan.md](city-combobox-plan.md).

## Architecture

A mudança se restringe a `components/`, `App.tsx` e `tailwind.config.js`. `useWeather`, `services/`, `lib/` e `types/` não mudam.

| Arquivo | Mudança | Requisito |
| --- | --- | --- |
| `tailwind.config.js` | Adicionar `accent-700` (`#4a55d4`). | FR-A11Y-01 |
| `src/components/SearchBar.tsx` | Botão `bg-accent-600 hover:bg-accent-700`; anel de foco do input em `accent-400` sólido; novas props `invalid` e `errorId`. | FR-A11Y-01, 03, 06 |
| `src/components/UnitToggle.tsx` | `aria-pressed:bg-accent-600`; `aria-label` Celsius/Fahrenheit; `focus-visible:`. | FR-A11Y-01, 06, 08 |
| `src/components/CityResults.tsx` | `<form>` com `<select>` controlado e botão "Ver previsão"; contagem com `role="status"`. | FR-A11Y-02, 04 |
| `src/components/states/EmptyState.tsx` | `role="status"` e prop opcional `id`. | FR-A11Y-03 |
| `src/components/states/LoadingState.tsx` | Remover `aria-live` redundante. | Achado 10 |
| `src/components/states/ErrorState.tsx` | Remover `aria-live` redundante; `focus-visible:`. | Achado 10, FR-A11Y-06 |
| `src/components/CurrentWeather.tsx` | `h2` com `tabIndex={-1}` e foco via `ref` + `useEffect` ao mudar de cidade. | FR-A11Y-05 |
| `src/components/ForecastCard.tsx` | Data em `<h3 id>`; `article aria-labelledby`; prefixos `sr-only` "Máxima"/"Mínima". | FR-A11Y-07 |
| `src/App.tsx` | Remover `aria-live` da seção de clima; repassar `invalid`/`errorId` ao `SearchBar` e `id` ao `EmptyState`; `key` em `CityResults`. | FR-A11Y-02, 03, 05 |

## Decisões técnicas

| Decisão | Escolha | Trade-off |
| --- | --- | --- |
| Tons de destaque | Base `accent-600` (4,6:1 com branco); hover `accent-700` (mais escuro, contraste maior). | Botões ficam levemente mais escuros; o hover escurece em vez de clarear. |
| Confirmação da cidade | `<form onSubmit>` em volta de `<select>` controlado + `<button type="submit">`. | Um clique a mais, mas o `select` nativo fica previsível em todos os navegadores e atende WCAG 3.2.2. `Enter` no `select` não envia o form de forma consistente; o botão é o caminho garantido. |
| Reset em nova busca | `App` passa `key` derivada dos ids das cidades para `CityResults`. | A remontagem descarta `selectedId` sem lógica extra de sincronização. |
| Associação erro ↔ input | `SearchBar` recebe `invalid` e `errorId`; o `App` deriva `invalid` de `searchStatus === 'empty'`. | `SearchBar` continua sem conhecer `WeatherError`. |
| Anúncio da carga | Foco no `h2` da cidade em vez de live region. | Move o foco do usuário, o que é aceitável porque a carga resulta de uma ação explícita dele (confirmar a cidade). |
| Foco em `h2` | `tabIndex={-1}` + `focus:outline-none` apenas no título. | O título não entra na ordem de tabulação. |
| `focus` → `focus-visible` | Em todos os controles. | O anel não aparece mais ao clicar com o mouse; o teclado continua com indicador. |
| Nomes das unidades | `aria-label="Celsius"` / `"Fahrenheit"`. | Testes que usam `name: '°C' / '°F'` precisam ser atualizados. |

## Contratos

```ts
interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  errorId?: string;
}

interface EmptyStateProps {
  message: string;
  id?: string;
}
// CityResultsProps inalterado: { cities: City[]; onSelect: (city: City) => void }
```

## Impacto em testes

| Teste | Ajuste |
| --- | --- |
| `CityResults.test.tsx` | `selectOptions` não chama `onSelect`; clicar em "Ver previsão" chama uma vez; botão desabilitado sem escolha; contagem com `role="status"`. |
| `App.test.tsx` | Fluxo passa a clicar em "Ver previsão"; `name: '°F'` vira `'Fahrenheit'`; foco no título da cidade após a carga; `aria-invalid` na busca inválida. |
| `UnitToggle.test.tsx` | Nomes "Celsius"/"Fahrenheit". |
| `states.test.tsx` | `EmptyState` com `role="status"`. |
| `ForecastCard/ForecastList` | `getByRole('article', { name: <data> })`; texto "Máxima"/"Mínima". |
| `weather.spec.ts` (E2E) | `getByRole('status')` passa a usar `.filter({ hasText: 'Carregando' })` (pode haver mais de um `status`); selecionar + clicar em "Ver previsão"; botões de unidade por nome novo. |

## Validação

- Contraste recalculado para os pares alterados (texto ≥ 4,5:1; foco ≥ 3:1).
- Navegação só por teclado: busca → resultados → "Ver previsão" → unidades → retry.
- `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:e2e`.

## Risks

| Risco | Mitigação |
| --- | --- |
| Múltiplas regiões `status` quebram seletores estritos | Localizar cada `status` pelo texto. |
| Mover o foco desorienta o usuário | Mover somente após a ação explícita "Ver previsão" e só em caso de sucesso. |
| Mudança de fluxo no combobox contraria `AC-CB-03` | A spec deste incremento substitui `AC-CB-03`/`AC-CB-04` explicitamente. |
