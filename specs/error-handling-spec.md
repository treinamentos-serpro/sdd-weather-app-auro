# Incremento — Tratamento de falhas e retry — Especificação

> **Base:** [weather-app-spec.md](weather-app-spec.md) (`FR-09`, `AC-09`, `AC-12`, `NFR-04`) e [a11y-hardening-spec.md](a11y-hardening-spec.md).
> **Origem:** revisão de `src/services/weatherService.ts` e `src/hooks/useWeather.ts`.

## Overview

O tratamento de falhas cobre timeout, 429, JSON inválido e rede, e o retry refaz a última operação. A revisão encontrou classificações incorretas em casos de borda, mensagens que não orientam o usuário e perda de foco após o retry. Este incremento corrige esses pontos sem alterar o fluxo nem os contratos de dados.

## Achados da revisão

| # | Severidade | Achado |
| --- | --- | --- |
| 1 | Alta | Timeout durante a leitura do corpo (`response.json()`) é classificado como `invalid-response`. |
| 2 | Média | Sinal externo já abortado antes da chamada é ignorado; o `fetch` segue até terminar ou atingir o timeout. |
| 3 | Média | HTTP 4xx (exceto 429) vira `network` sem retry, com a mensagem "Não foi possível conectar", embora a conexão tenha ocorrido. |
| 4 | Média | As mensagens de erro não dizem ao usuário o que fazer. |
| 5 | Baixa | Após "Tentar novamente", o botão desmonta e o foco volta para o `body`. |

## Functional Requirements

### FR-ERR-01 — Timeout em qualquer fase

Uma consulta que exceder 10 segundos, seja aguardando a resposta ou lendo o corpo, deve ser classificada como `timeout` e oferecer retry.

### FR-ERR-02 — Respeitar cancelamento prévio

Uma consulta iniciada com sinal já cancelado deve ser abortada imediatamente, sem requisição pendente.

### FR-ERR-03 — Classificar respostas HTTP de erro

- `429` → `rate-limit`, com retry.
- `5xx` → `network` (serviço indisponível), com retry.
- Demais `4xx` → `invalid-response`, sem retry.

### FR-ERR-04 — Mensagens amigáveis e acionáveis

Cada mensagem de erro deve explicar o problema e indicar a próxima ação, em pt-BR:

| Tipo | Mensagem |
| --- | --- |
| `timeout` | A consulta demorou mais de 10 segundos. Verifique sua conexão e tente novamente. |
| `network` | Não foi possível conectar ao serviço de clima. Verifique sua internet e tente novamente. |
| `rate-limit` | Limite de requisições atingido. Tente novamente em instantes. |
| `invalid-response` | O serviço retornou dados inválidos. Tente novamente em instantes. |

### FR-ERR-05 — Retry refaz a última operação e preserva o foco

"Tentar novamente" deve refazer apenas a última operação que falhou: busca ou previsão. Ao terminar o retry, o foco vai para o resultado: o campo "Resultados da busca" após uma busca bem-sucedida, o título da cidade após uma previsão bem-sucedida, ou o novo botão "Tentar novamente" se a falha se repetir.

## Acceptance Criteria

### AC-ERR-01 — FR-ERR-01

- **Given** que a API responde aos cabeçalhos, mas o corpo não chega em 10 s
- **When** o limite é atingido
- **Then** o erro é `timeout` com `retryable = true`.

### AC-ERR-02 — FR-ERR-02

- **Given** um `AbortSignal` já abortado
- **When** o serviço é chamado
- **Then** o `fetch` recebe um sinal abortado e a promessa rejeita.

### AC-ERR-03 — FR-ERR-03

- **Given** respostas HTTP 404 e 503
- **When** o serviço as classifica
- **Then** 404 → `invalid-response`, sem retry; 503 → `network`, com retry.

### AC-ERR-04 — FR-ERR-04

- **Given** qualquer erro exibido
- **When** o usuário lê a mensagem
- **Then** ela corresponde à tabela de FR-ERR-04.

### AC-ERR-05 — FR-ERR-05 (offline na busca)

- **Given** que o usuário está offline e busca uma cidade
- **When** a conexão volta e ele aciona "Tentar novamente"
- **Then** somente o geocoding é refeito, os resultados aparecem e o foco está em "Resultados da busca".

### AC-ERR-06 — FR-ERR-05 (offline na previsão)

- **Given** que a busca funcionou e a previsão falha por falta de conexão
- **When** o usuário aciona "Tentar novamente"
- **Then** somente a previsão é refeita e, com sucesso, o foco vai para o título da cidade.

### AC-ERR-07 — FR-ERR-05 (falha repetida)

- **Given** que o retry falha novamente
- **When** o erro reaparece
- **Then** o foco está no novo botão "Tentar novamente".

## Non-Functional Requirements

- **NFR-ERR-01:** Sem novas dependências; o timeout continua em 10 s.
- **NFR-ERR-02:** Mensagens em pt-BR (`NFR-09`).
- **NFR-ERR-03:** O foco só é movido após uma ação explícita de retry (`NFR-03`).

## Out of Scope

- Respeitar o header `Retry-After` do 429.
- Retry automático com backoff.
- Detecção proativa de offline via `navigator.onLine`.
- Cancelar requisições ao desmontar o hook.
