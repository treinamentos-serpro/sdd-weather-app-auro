# Incremento — Hardening de acessibilidade — Especificação

> **Base:** [weather-app-spec.md](weather-app-spec.md) (`NFR-03`, `NFR-AC-03`) e [city-combobox-spec.md](city-combobox-spec.md).
> **Origem:** auditoria de acessibilidade de `src/` (WCAG 2.2 AA).
> **Substitui:** `AC-CB-03` e `AC-CB-04` da spec do combobox, redefinidos em `FR-A11Y-02` / `AC-A11Y-02`.

## Overview

A auditoria encontrou falhas de contraste, de anúncio de mudanças de estado e de comportamento por teclado que impedem o cumprimento pleno de `NFR-03` (WCAG 2.2 AA). Este incremento corrige esses pontos sem mudar o fluxo funcional do produto nem a camada de dados.

## Achados da auditoria

| # | Severidade | Critério WCAG | Achado |
| --- | --- | --- | --- |
| 1 | Alta | 1.4.3 | Texto branco sobre `accent-500` (3,5:1) e `accent-400` no hover (~2,5:1) no botão "Buscar" e no °C/°F selecionado. |
| 2 | Alta | 3.2.2 | O combobox de cidades consulta o clima no `change`; no Chrome/Edge (Windows/Linux), cada seta dispara uma requisição. |
| 3 | Média | 4.1.3 | Mensagens de vazio/validação (`EmptyState`) não são anunciadas nem associadas ao campo de busca. |
| 4 | Média | 4.1.3 | A quantidade de cidades encontradas não é anunciada. |
| 5 | Média | 4.1.3 | `aria-live` na seção de clima relê todo o conteúdo ao alternar a unidade e não anuncia a carga com confiabilidade. |
| 6 | Média | 1.4.11 | O anel de foco do campo de busca (`accent-400/40`) tem ~2,2:1 contra o card. |
| 7 | Baixa | 1.3.1 | Máxima e mínima da previsão são lidas como "25°C barra 17°C". |
| 8 | Baixa | 1.3.1 / 2.4.6 | Os cards de previsão (`article`) não têm nome acessível. |
| 9 | Baixa | 2.5.3 / 4.1.2 | Botões de unidade com nome "°C"/"°F" são lidos de forma inconsistente. |
| 10 | Baixa | — | `aria-live` redundante com `role="alert"` / `role="status"`. |
| 11 | Baixa | — | Anel de foco aparece também no clique do mouse (`focus:` em vez de `focus-visible:`). |

## Functional Requirements

### FR-A11Y-01 — Contraste dos controles primários

Texto sobre fundos de destaque (botão de busca, unidade selecionada) deve ter contraste de pelo menos 4,5:1 em todos os estados: repouso, hover e selecionado.

### FR-A11Y-02 — Seleção de cidade com confirmação explícita

Escolher uma opção no campo "Resultados da busca" apenas marca a cidade. A consulta meteorológica deve iniciar somente quando o usuário acionar o botão "Ver previsão" (clique, `Enter` ou `Espaço`). O botão fica desabilitado enquanto nenhuma cidade estiver escolhida.

### FR-A11Y-03 — Anunciar estados de vazio e validação

Mensagens de busca inválida, cidade não encontrada e dados insuficientes devem ser anunciadas por tecnologia assistiva. Quando a mensagem se referir à busca, o campo "Cidade" deve ser marcado como inválido e referenciar a mensagem.

### FR-A11Y-04 — Anunciar resultados da busca

A quantidade de cidades encontradas deve ser anunciada quando os resultados aparecerem.

### FR-A11Y-05 — Anunciar a carga do clima sem ruído

Quando o clima for carregado com sucesso, o foco deve ir para o título com o nome da cidade. Alternar a unidade não deve reler o conteúdo da seção.

### FR-A11Y-06 — Indicador de foco perceptível

Todo controle focável deve ter indicador de foco com contraste de pelo menos 3:1 contra o fundo adjacente, visível na navegação por teclado.

### FR-A11Y-07 — Semântica da previsão diária

Cada card de previsão deve ser nomeado pela sua data, e as temperaturas devem ser identificadas como "Máxima" e "Mínima" para tecnologia assistiva, sem mudar o visual.

### FR-A11Y-08 — Nomes dos botões de unidade

Os botões de unidade devem ter nomes acessíveis "Celsius" e "Fahrenheit", mantendo °C/°F visíveis.

## Acceptance Criteria

### AC-A11Y-01 — FR-A11Y-01

- **Given** o botão "Buscar" e o botão de unidade selecionado
- **When** medidos em repouso, hover e estado selecionado
- **Then** o texto tem contraste ≥ 4,5:1 contra o fundo.

### AC-A11Y-02 — FR-A11Y-02 (substitui AC-CB-03 e AC-CB-04)

- **Given** que o campo "Resultados da busca" está visível e focado
- **When** o usuário percorre as opções com as setas
- **Then** nenhuma consulta meteorológica é iniciada.
- **And** ao acionar "Ver previsão" com uma cidade escolhida, a consulta é iniciada uma única vez para essa cidade.
- **And** "Ver previsão" fica desabilitado sem cidade escolhida.

### AC-A11Y-03 — FR-A11Y-03

- **Given** que o usuário envia uma busca inválida ou sem resultados
- **When** a mensagem é exibida
- **Then** ela está em uma região `status`, o campo "Cidade" tem `aria-invalid="true"` e `aria-describedby` aponta para a mensagem.
- **And** ao digitar uma nova busca válida e enviá-la, `aria-invalid` é removido.

### AC-A11Y-04 — FR-A11Y-04

- **Given** que a busca retorna cidades
- **When** o campo de resultados aparece
- **Then** o texto "N cidades encontradas" está em uma região `status`.

### AC-A11Y-05 — FR-A11Y-05

- **Given** que o usuário confirmou uma cidade
- **When** o clima é exibido
- **Then** o título com o nome da cidade recebe o foco.
- **And** a seção de clima não possui `aria-live`.

### AC-A11Y-06 — FR-A11Y-06

- **Given** que o usuário navega por teclado
- **When** qualquer controle recebe foco
- **Then** o indicador de foco tem contraste ≥ 3:1 e não aparece ao clicar com o mouse.

### AC-A11Y-07 — FR-A11Y-07

- **Given** a previsão de 5 dias
- **When** lida por tecnologia assistiva
- **Then** cada `article` tem nome igual à data exibida, e as temperaturas são precedidas por "Máxima"/"Mínima" em texto só para leitores de tela.

### AC-A11Y-08 — FR-A11Y-08

- **Given** o grupo "Unidade de temperatura"
- **When** lido por tecnologia assistiva
- **Then** os botões se chamam "Celsius" e "Fahrenheit", mantêm `aria-pressed` e exibem °C/°F.

## Non-Functional Requirements

- **NFR-A11Y-01:** Sem regressão visual relevante no tema dark glassmorphism nem rolagem horizontal nos viewports de `NFR-01`.
- **NFR-A11Y-02:** Todos os textos novos em pt-BR (`NFR-09`).
- **NFR-A11Y-03:** Sem dependências novas; apenas HTML nativo, ARIA e Tailwind.

## Edge Cases

- **Resultado único:** o botão "Ver previsão" continua exigindo uma escolha explícita.
- **Nova busca:** reseta a escolha e desabilita "Ver previsão".
- **Busca inválida seguida de busca válida:** remove `aria-invalid` e `aria-describedby`.
- **Loading e contagem simultâneos:** mais de uma região `status` pode coexistir; os testes devem localizar cada uma pelo texto.
- **Falha na carga do clima:** o foco permanece onde estava e o `role="alert"` anuncia o erro.

## Out of Scope

- Autocomplete ou combobox ARIA customizado.
- Suporte a `prefers-reduced-motion` e tema claro.
- Auditoria automatizada com axe (candidata a incremento futuro).
