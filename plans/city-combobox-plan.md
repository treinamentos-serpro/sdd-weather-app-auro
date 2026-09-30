# Incremento — Seleção de cidade em combobox — Plano Técnico

> **Consome:** [specs/city-combobox-spec.md](../specs/city-combobox-spec.md). **Base:** [weather-app-plan.md](weather-app-plan.md).

## Architecture

A mudança fica restrita à camada `components/`. `useWeather`, os services, `lib/` e `types/` não mudam.

| Arquivo | Mudança |
| --- | --- |
| `src/components/CityResults.tsx` | Troca `<ul>` de botões por `<label>` + `<select>` nativo. |
| `src/App.tsx` | Sem mudança: as props `cities` e `onSelect` continuam iguais. |

## Decisões técnicas

| Decisão | Escolha | Trade-off |
| --- | --- | --- |
| Tipo de combobox | `<select>` nativo (papel `combobox` implícito) | Teclado, leitor de tela e seletor nativo do mobile sem JS extra nem dependência nova. A estilização das opções é limitada; um combobox ARIA customizado exigiria gerenciar foco e `aria-activedescendant` manualmente. |
| Valor da opção | `city.id` | Identificador estável; o `onChange` localiza a `City` por id. |
| Placeholder | `<option value="" disabled>` com `defaultValue=""` | Impede consulta antes da escolha (FR-CB-02). |
| Reset em nova busca | `key` do `<select>` derivada dos ids das cidades | Remonta o campo e volta ao placeholder sem estado extra. |
| Rótulo | "Resultados da busca" | Não contém "Cidade", evitando conflito com `getByLabel('Cidade')` do campo de busca. |
| Contraste das opções | `bg-night-900 text-white` em cada `<option>` | Evita texto branco em fundo branco nas listas nativas. |

## Contrato do componente

```ts
interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}
```

- `cities.length === 0` → não renderiza nada.
- Uma escolha → `onSelect(city)` chamado uma única vez.

## Testing Strategy

- **Vitest (`CityResults.test.tsx`):** papel `combobox`, placeholder desabilitado, opções de homônimas, texto de quantidade, foco via `Tab`, `selectOptions` chama `onSelect` uma vez, lista vazia não renderiza.
- **Vitest (`App.test.tsx`):** fluxo busca → escolha → clima; concorrência validada por `option`.
- **Playwright (`weather.spec.ts`):** `selectOption` nos fluxos principais, nos três viewports.

## Risks

| Risco | Mitigação |
| --- | --- |
| Testes existentes baseados em `button` quebram | Atualizá-los no mesmo incremento (T-CB-02, T-CB-03). |
| Aparência da lista nativa varia por navegador | Aceito; a acessibilidade e o uso em mobile têm prioridade. |
