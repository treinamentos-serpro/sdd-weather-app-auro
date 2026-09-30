# Incremento — Seleção de cidade em combobox — Especificação

> **Base:** [weather-app-spec.md](weather-app-spec.md). Este incremento refina `FR-02` e `AC-02b` sem alterar as demais regras do produto.

## Overview

Buscas por nomes comuns (ex.: "Porto Alegre") retornam até 10 cidades. Hoje cada resultado é um cartão empilhado, o que ocupa a tela inteira, empurra o clima para fora da área visível e dificulta o uso em mobile. O incremento substitui a lista de cartões por um único campo de seleção (combobox).

## Functional Requirements

### FR-CB-01 — Apresentar resultados em um campo de seleção

Quando a busca retornar uma ou mais cidades, o sistema deve apresentá-las em um único campo de seleção com nome acessível "Resultados da busca", em vez de uma lista de cartões.

### FR-CB-02 — Estado inicial sem seleção

O campo deve iniciar com a opção "Selecione uma cidade", que não pode ser escolhida como cidade. Nenhuma consulta meteorológica deve ocorrer antes de o usuário escolher uma cidade.

### FR-CB-03 — Identificar cada opção

Cada opção deve exibir "cidade, região/estado, país", omitindo partes ausentes, para diferenciar cidades homônimas (mantém `AC-02b`).

### FR-CB-04 — Consultar ao escolher

Ao escolher uma cidade, por mouse, toque ou teclado, o sistema deve iniciar a consulta meteorológica da cidade escolhida uma única vez.

### FR-CB-05 — Informar quantidade

O sistema deve informar a quantidade de cidades encontradas ("1 cidade encontrada" / "N cidades encontradas").

## Acceptance Criteria

### AC-CB-01 — FR-CB-01, FR-CB-02, FR-CB-05: exibir combobox

- **Given** que a busca retorna duas ou mais cidades
- **When** o sistema apresenta os resultados
- **Then** exibe um único campo "Resultados da busca" com "Selecione uma cidade" selecionado, uma opção por cidade e o texto com a quantidade encontrada.
- **And** nenhuma consulta meteorológica foi iniciada.

### AC-CB-02 — FR-CB-03: diferenciar homônimas

- **Given** que a busca retorna cidades com o mesmo nome
- **When** o usuário abre o campo
- **Then** cada opção mostra região/estado e país quando disponíveis.

### AC-CB-03 — FR-CB-04: consultar a cidade escolhida

- **Given** que o campo está visível
- **When** o usuário escolhe uma cidade
- **Then** a consulta meteorológica é iniciada uma única vez para essa cidade e o clima é exibido.

### AC-CB-04 — FR-CB-04: operar por teclado

- **Given** que o usuário navega apenas por teclado
- **When** foca o campo e escolhe uma opção
- **Then** o campo tem foco visível e a escolha inicia a consulta.

### AC-CB-05 — Regressão: busca mais recente

- **Given** que uma busca anterior ainda está em andamento
- **When** uma nova busca termina primeiro
- **Then** o campo exibe somente as opções da busca mais recente (mantém `AC-06b`).

## Non-Functional Requirements

- **NFR-CB-01:** Sem rolagem horizontal nos viewports 375 × 667, 768 × 1024 e 1440 × 900 (herda `NFR-01`).
- **NFR-CB-02:** WCAG 2.2 AA: nome acessível, foco visível e contraste das opções no tema escuro (herda `NFR-03`).
- **NFR-CB-03:** Textos em pt-BR (herda `NFR-09`).

## Edge Cases

- **Um único resultado:** o campo continua sendo exibido e exige uma escolha explícita.
- **Nova busca:** o campo volta para "Selecione uma cidade" com as novas opções.
- **Busca inválida, vazia ou com erro:** o campo não é exibido.
- **Região ausente:** a opção exibe apenas "cidade, país".

## Out of Scope

- Autocomplete enquanto o usuário digita.
- Filtragem das opções dentro do campo.
- Alterações no serviço de geocoding, no hook `useWeather` ou no limite de resultados.
