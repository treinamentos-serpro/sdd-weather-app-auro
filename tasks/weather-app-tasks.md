# Weather App — Tarefas de Implementação

Backlog derivado de [plans/weather-app-plan.md](../plans/weather-app-plan.md). A ordem numérica representa a ordem recomendada de implementação; cada tarefa possui escopo testável e dependências apenas de tarefas anteriores.

## Entrega 1 — Tipos e contratos

### T-01 — Definir contratos de domínio
- **Tipo:** Data
- **Descrição:** Criar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `WeatherStatus` e `WeatherError`.
- **Critérios de aceite:** Os tipos refletem o plano; `Unit` aceita apenas `celsius`/`fahrenheit`; `WeatherError.kind` contempla input inválido, não encontrado, timeout, rate limit, rede e resposta inválida; o TypeScript strict compila.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Requisitos relacionados:** FR-01 a FR-10, NFR-07.

## Entrega 2 — Funções puras

### T-02 — Implementar conversão Celsius/Fahrenheit
- **Tipo:** Data
- **Descrição:** Criar conversão pura mantendo Celsius como unidade de origem.
- **Critérios de aceite:** Usa `F = C * 9 / 5 + 32`; trata zero, negativos e decimais; não altera o valor de origem.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Requisitos relacionados:** FR-05, NFR-07.

### T-03 — Implementar formatação de temperatura
- **Tipo:** Data
- **Descrição:** Criar função para arredondar o valor exibido e acrescentar a unidade.
- **Critérios de aceite:** Arredonda ao inteiro mais próximo; exibe `°C`/`°F`; não faz request.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Requisitos relacionados:** FR-05, AC-05.

### T-04 — Implementar formatação de datas
- **Tipo:** Data
- **Descrição:** Formatar datas e horários no timezone da cidade.
- **Critérios de aceite:** Usa `dd/MM` e `HH:mm`; com timezone `America/Sao_Paulo`, o resultado não depende do timezone do navegador.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Requisitos relacionados:** FR-03, FR-04, FR-10, NFR-09.

### T-05 — Implementar tradução de códigos WMO
- **Tipo:** Data
- **Descrição:** Mapear códigos WMO para labels em pt-BR.
- **Critérios de aceite:** Códigos conhecidos têm labels; código desconhecido tem fallback; a função não faz I/O.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Requisitos relacionados:** FR-03, FR-04, NFR-09.

## Entrega 3 — Services e acesso a dados

### T-06 — Implementar service de geocoding
- **Tipo:** Data
- **Descrição:** Encapsular geocoding e mapear resultados para `City`.
- **Critérios de aceite:** URL contém `name`, `count=10`, `language=pt` e `format=json`; input vazio/símbolos não chama API; caracteres válidos são preservados; resultados mapeiam localização/timezone; lista vazia retorna `[]`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Requisitos relacionados:** FR-01, FR-02, FR-07, AC-01, AC-01b, AC-02b.

### T-07 — Implementar service de forecast
- **Tipo:** Data
- **Descrição:** Encapsular forecast e normalizar a resposta para `WeatherData`.
- **Critérios de aceite:** URL contém Celsius, `timezone=auto`, `forecast_days=5`, `current` e `daily`; arrays são combinados por índice; cinco dias e campos essenciais são validados; condição diária pode faltar.
- **Dependências:** T-01, T-04, T-05, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Requisitos relacionados:** FR-03, FR-04, FR-08, FR-10, AC-03, AC-04, AC-08, AC-10, AC-13, AC-14.

### T-08 — Implementar erros, timeout e retryability
- **Tipo:** Data
- **Descrição:** Classificar HTTP, rede, timeout, rate limit e resposta inválida.
- **Critérios de aceite:** Mais de 10 s produz `timeout`; `429` produz `rate-limit`; falha de conexão produz `network`; JSON/campos inválidos produzem `invalid-response`; cada erro informa se é retryable.
- **Dependências:** T-01, T-06, T-07.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Requisitos relacionados:** FR-08, FR-09, AC-09, AC-12, NFR-04.

## Entrega 4 — Hook de estado

### T-09 — Implementar useWeather
- **Tipo:** Data
- **Descrição:** Orquestrar geocoding, forecast, estados independentes, retry e precedência entre requests.
- **Critérios de aceite:** Mantém `searchStatus`/`weatherStatus`; expõe query, resultados, cidade, dados e erros; publica idle/loading/success/empty/error; retry repete a operação falha; request antigo não sobrescreve o recente.
- **Dependências:** T-06, T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Requisitos relacionados:** FR-02, FR-06, FR-07, FR-08, FR-09, AC-02, AC-06, AC-06b, AC-07, AC-08, AC-09.

## Entrega 5 — Componentes de apresentação

### T-10 — Criar shell da aplicação
- **Tipo:** UI
- **Descrição:** Criar estrutura visual base sem acesso à API.
- **Critérios de aceite:** Renderiza regiões para busca, resultados, clima, previsão e unidade; não chama `fetch`; recebe dados/handlers por props.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/App.tsx`.
- **Requisitos relacionados:** NFR-05, NFR-06.

### T-11 — Configurar estilos globais e responsividade
- **Tipo:** UI
- **Descrição:** Aplicar Tailwind e estilos responsivos.
- **Critérios de aceite:** Nos viewports `375x667`, `768x1024` e `1440x900`, `scrollWidth` não excede `innerWidth`; conteúdo essencial permanece visível.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/styles/index.css`, `tailwind.config.js`.
- **Requisitos relacionados:** NFR-01, NFR-06.

### T-12 — Criar SearchBar
- **Tipo:** UI
- **Descrição:** Implementar campo, submit e validação local.
- **Critérios de aceite:** Possui label acessível; aceita teclado; bloqueia vazio/símbolos; preserva caracteres válidos; não chama service diretamente.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Requisitos relacionados:** FR-01, FR-07, AC-01, AC-01b, AC-07, AC-11, NFR-03.

### T-13 — Criar CityResults
- **Tipo:** UI
- **Descrição:** Renderizar resultados e seleção por callback.
- **Critérios de aceite:** Mostra localização disponível; diferencia homônimos; `Enter` seleciona o resultado focado; não acessa API.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Requisitos relacionados:** FR-02, AC-02, AC-02b, NFR-03.

### T-14 — Criar CurrentWeather
- **Tipo:** UI
- **Descrição:** Renderizar clima atual recebido por props.
- **Critérios de aceite:** Mostra cidade, temperatura, unidade, condição e horário; localização opcional aparece quando presente; dados obrigatórios ausentes mostram estado insuficiente.
- **Dependências:** T-01, T-03, T-04, T-05, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Requisitos relacionados:** FR-03, FR-08, AC-03, AC-03b, AC-13.

### T-15 — Criar ForecastList
- **Tipo:** UI
- **Descrição:** Compor a lista de previsão diária.
- **Critérios de aceite:** Com cinco `ForecastDay`, renderiza exatamente cinco cards na ordem recebida; passa item e timezone ao card; não acessa API.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Requisitos relacionados:** FR-04, FR-10, AC-04, AC-10.

### T-16 — Criar ForecastCard
- **Tipo:** UI
- **Descrição:** Renderizar um dia da previsão.
- **Critérios de aceite:** Mostra data, mínima e máxima; usa timezone recebido; condição ausente gera texto de indisponibilidade, nunca `null`/`undefined`.
- **Dependências:** T-03, T-04, T-05.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.
- **Requisitos relacionados:** FR-04, FR-08, AC-08, AC-14.

### T-17 — Criar UnitToggle
- **Tipo:** UI
- **Descrição:** Implementar controle Celsius/Fahrenheit por callback.
- **Critérios de aceite:** Inicia em Celsius; possui nome acessível; altera apresentação; não chama forecast; funciona por teclado.
- **Dependências:** T-02, T-03, T-10.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Requisitos relacionados:** FR-05, AC-05, NFR-03, NFR-07.

### T-18 — Criar LoadingState
- **Tipo:** UI
- **Descrição:** Renderizar carregamento.
- **Critérios de aceite:** Usa role `status` ou equivalente; texto em pt-BR; não renderiza conteúdo de sucesso.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Requisitos relacionados:** FR-06, AC-06, NFR-03, NFR-09.

### T-19 — Criar EmptyState
- **Tipo:** UI
- **Descrição:** Renderizar input inválido, ausência de resultados e dados insuficientes.
- **Critérios de aceite:** Mensagens distintas para `invalid-input`, `not-found` e dados insuficientes; nova tentativa permanece disponível; textos em pt-BR.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Requisitos relacionados:** FR-07, FR-08, AC-07, AC-08, NFR-09.

### T-20 — Criar ErrorState
- **Tipo:** UI
- **Descrição:** Renderizar erro e retry.
- **Critérios de aceite:** Mensagem usa `WeatherError.kind`; botão aparece somente com `retryable=true`; tem nome, foco e teclado acessíveis; textos em pt-BR.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Requisitos relacionados:** FR-09, AC-09, AC-12, NFR-03, NFR-09.

## Entrega 6 — Integração

### T-21 — Integrar App e fluxo completo
- **Tipo:** UI
- **Descrição:** Conectar hook, componentes, unidade derivada e handlers.
- **Critérios de aceite:** Busca, seleção, forecast e renderização funcionam; toggle não chama forecast; cada status renderiza o estado correspondente; teclado funciona.
- **Dependências:** T-09, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-20.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Requisitos relacionados:** FR-01 a FR-10, NFR-01, NFR-03, NFR-07, NFR-09.

## Entrega 7 — Testes

### T-22 — Testar conversão de unidade
- **Tipo:** Test
- **Descrição:** Testar exclusivamente conversão, arredondamento e apresentação Celsius/Fahrenheit.
- **Critérios de aceite:** Verifica zero, negativos, decimais, fórmula Fahrenheit, arredondamento, símbolos de unidade e ausência de request.
- **Dependências:** T-02, T-03, T-21.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Requisitos relacionados:** FR-05, AC-05, NFR-07.

### T-23 — Testar formatação e códigos meteorológicos
- **Tipo:** Test
- **Descrição:** Testar datas, timezone e tradução WMO.
- **Critérios de aceite:** Verifica `dd/MM`, `HH:mm`, timezone diferente do ambiente, códigos conhecidos e fallback desconhecido.
- **Dependências:** T-04, T-05, T-21.
- **Arquivos prováveis:** `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`.
- **Requisitos relacionados:** FR-03, FR-04, FR-10, NFR-09.

### T-24 — Testar service de geocoding com mock de fetch
- **Tipo:** Test
- **Descrição:** Testar exclusivamente o service de geocoding na fronteira HTTP.
- **Critérios de aceite:** Verifica URL/parâmetros, mapeamento para `City`, input inválido, sem resultados e homônimos; valida contrato normalizado e não chama forecast.
- **Dependências:** T-06, T-08, T-21.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Requisitos relacionados:** FR-01, FR-02, FR-07, AC-01, AC-01b, AC-02b.

### T-25 — Testar service de forecast com mock de fetch
- **Tipo:** Test
- **Descrição:** Testar exclusivamente o service de forecast na fronteira HTTP.
- **Critérios de aceite:** Verifica parâmetros, `WeatherData`, cinco dias, resposta parcial, campos ausentes, `429`, JSON inválido, rede e timeout.
- **Dependências:** T-07, T-08, T-21.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Requisitos relacionados:** FR-03, FR-04, FR-08, FR-09, FR-10, AC-03, AC-04, AC-08, AC-09, AC-12, AC-13, AC-14.

### T-26 — Testar componentes de busca
- **Tipo:** Test
- **Descrição:** Testar `SearchBar` e `CityResults` com Testing Library.
- **Critérios de aceite:** Cobre input inválido, submit, resultados, homônimos, seleção, teclado e labels; não usa rede.
- **Dependências:** T-12, T-13, T-21.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`.
- **Requisitos relacionados:** FR-01, FR-02, FR-07, AC-01, AC-02, AC-07, AC-11, NFR-03.

### T-27 — Testar componentes meteorológicos
- **Tipo:** Test
- **Descrição:** Testar `CurrentWeather`, `ForecastList` e `ForecastCard`.
- **Critérios de aceite:** Cobre campos obrigatórios, cinco dias, timezone, mínimas/máximas, condição ausente e valores inválidos.
- **Dependências:** T-14, T-15, T-16, T-21.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastList.test.tsx`, `tests/unit/ForecastCard.test.tsx`.
- **Requisitos relacionados:** FR-03, FR-04, FR-08, FR-10, AC-03, AC-04, AC-08, AC-10, AC-13, AC-14.

### T-28 — Testar UnitToggle
- **Tipo:** Test
- **Descrição:** Testar exclusivamente o controle de unidade.
- **Critérios de aceite:** Inicia Celsius; troca para Fahrenheit; não dispara forecast; teclado e labels funcionam.
- **Dependências:** T-17, T-21.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Requisitos relacionados:** FR-05, AC-05, NFR-03, NFR-07.

### T-29 — Testar estados loading/erro/vazio
- **Tipo:** Test
- **Descrição:** Testar exclusivamente `LoadingState`, `ErrorState` e `EmptyState`.
- **Critérios de aceite:** Loading usa status acessível; erro mostra retry somente quando permitido; vazio diferencia input inválido, não encontrado e dados insuficientes; mensagens, foco e teclado funcionam em pt-BR.
- **Dependências:** T-18, T-19, T-20, T-21.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.
- **Requisitos relacionados:** FR-06, FR-07, FR-08, FR-09, AC-06, AC-07, AC-08, AC-09, NFR-03, NFR-09.

### T-30 — Testar hook e integração local
- **Tipo:** Test
- **Descrição:** Testar transições do hook e integração dos componentes.
- **Critérios de aceite:** Verifica todos os status; retry chama apenas a operação falha; request antigo não altera o resultado recente; seleção produz forecast; unidade não chama forecast.
- **Dependências:** T-09, T-21.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`, `tests/unit/App.test.tsx`.
- **Requisitos relacionados:** FR-02, FR-05 a FR-09, AC-02, AC-05, AC-06, AC-06b, AC-07, AC-08, AC-09.

## Entrega 8 — Hardening

### T-31 — Validar E2E, performance, acessibilidade e qualidade final
- **Tipo:** Test
- **Descrição:** Executar Playwright e validações finais sem ampliar o MVP.
- **Critérios de aceite:** E2E cobre busca, seleção, clima, cinco dias, unidade, input inválido, cidade inexistente, parcial, rede, timeout, rate limit, retry e concorrência; cada cenário passa em `375x667`, `768x1024` e `1440x900`; loading até 100 ms; dados até 2 s após resposta válida; `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam.
- **Dependências:** T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`, `src/`, `tests/`.
- **Requisitos relacionados:** AC-01 a AC-14, NFR-01 a NFR-09.

## Rastreabilidade dos requisitos funcionais

| Requisito funcional | Tarefas de implementação | Tarefas de teste/validação | Cobertura |
| --- | --- | --- | --- |
| `FR-01` — Buscar cidades | `T-06`, `T-12`, `T-21` | `T-24`, `T-26`, `T-31` | Coberto |
| `FR-02` — Selecionar uma cidade | `T-06`, `T-09`, `T-13`, `T-21` | `T-24`, `T-26`, `T-30`, `T-31` | Coberto |
| `FR-03` — Exibir o clima atual | `T-07`, `T-14`, `T-21` | `T-25`, `T-27`, `T-30`, `T-31` | Coberto |
| `FR-04` — Exibir previsão de 5 dias | `T-07`, `T-15`, `T-16`, `T-21` | `T-25`, `T-27`, `T-31` | Coberto |
| `FR-05` — Alternar unidade de temperatura | `T-02`, `T-03`, `T-17`, `T-21` | `T-22`, `T-28`, `T-30`, `T-31` | Coberto |
| `FR-06` — Tratar carregamento | `T-09`, `T-18`, `T-21` | `T-29`, `T-30`, `T-31` | Coberto |
| `FR-07` — Tratar busca inválida ou sem resultados | `T-06`, `T-12`, `T-19`, `T-21` | `T-24`, `T-26`, `T-29`, `T-30`, `T-31` | Coberto |
| `FR-08` — Tratar ausência de dados meteorológicos | `T-07`, `T-08`, `T-14`, `T-16`, `T-19`, `T-21` | `T-25`, `T-27`, `T-29`, `T-30`, `T-31` | Coberto |
| `FR-09` — Tratar falhas de consulta | `T-08`, `T-09`, `T-20`, `T-21` | `T-25`, `T-29`, `T-30`, `T-31` | Coberto |
| `FR-10` — Usar hoje e os quatro dias seguintes | `T-04`, `T-07`, `T-15`, `T-16`, `T-21` | `T-23`, `T-27`, `T-31` | Coberto |

### Lacunas encontradas

Nenhum requisito funcional da spec ficou sem tarefa correspondente. Todos os requisitos `FR-01` a `FR-10` possuem tarefas de implementação e pelo menos uma tarefa de teste ou validação.

## Prioridade e tamanho

`P0` representa o caminho essencial do MVP; `P1` representa qualidade necessária antes da entrega; `P2` representa trabalho opcional ou posterior. O tamanho relativo considera escopo, incerteza e número de decisões envolvidas: `P` pequeno, `M` médio e `G` grande.

| Tarefa | Prioridade | Tamanho | Justificativa resumida |
| --- | --- | --- | --- |
| T-01 | P0 | P | Contratos centrais, um arquivo. |
| T-02 | P0 | P | Conversão pura e isolada. |
| T-03 | P0 | P | Formatação derivada de T-02. |
| T-04 | P0 | M | Timezone e formatação de datas. |
| T-05 | P0 | M | Mapeamento de códigos WMO. |
| T-06 | P0 | G | Integração de geocoding e normalização. |
| T-07 | P0 | G | Integração de forecast e validação de arrays. |
| T-08 | P0 | M | Classificação de falhas e timeout. |
| T-09 | P0 | G | Orquestração de duas operações assíncronas e concorrência. |
| T-10 | P0 | M | Composição inicial da aplicação. |
| T-11 | P0 | M | Responsividade e estilos globais. |
| T-12 | P0 | M | Busca e validação de entrada. |
| T-13 | P0 | P | Lista de resultados e seleção. |
| T-14 | P0 | M | Apresentação do clima atual. |
| T-15 | P0 | M | Composição da previsão. |
| T-16 | P0 | P | Apresentação de um dia. |
| T-17 | P0 | P | Controle de unidade. |
| T-18 | P0 | P | Estado de loading. |
| T-19 | P0 | P | Estado vazio. |
| T-20 | P0 | P | Estado de erro e retry. |
| T-21 | P0 | G | Integração da tela e todos os estados. |
| T-22 | P1 | P | Testes unitários da conversão. |
| T-23 | P1 | P | Testes de datas e códigos. |
| T-24 | P1 | M | Testes do geocoding com HTTP mockado. |
| T-25 | P1 | M | Testes do forecast com HTTP mockado. |
| T-26 | P1 | M | Testes de busca e seleção. |
| T-27 | P1 | M | Testes dos componentes meteorológicos. |
| T-28 | P1 | P | Testes do toggle. |
| T-29 | P1 | M | Testes dos estados loading/erro/vazio. |
| T-30 | P1 | G | Testes do hook e integração. |
| T-31 | P1 | G | E2E, performance, acessibilidade e checks finais. |

Não há tarefas `P2` no escopo atual: elas devem ser criadas somente quando surgir trabalho fora do MVP, como cache persistente, proxy próprio ou novas funcionalidades.

## Sequência em fatias verticais

Cada fatia entrega um comportamento observável. As tarefas dentro de uma fatia continuam respeitando suas dependências.

### Fatia 1 — Tela visível com dados estáticos

**Objetivo:** colocar uma tela navegável no ar rapidamente, mesmo antes da API.

**Tarefas:** `T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-10`, `T-11`, `T-14`, `T-15`, `T-16`, `T-17`, `T-18`, `T-19`, `T-20`.

**Entrega observável:** clima atual, previsão de cinco dias, toggle de unidade e estados visuais renderizados com dados controlados.

### Fatia 2 — Busca e consulta real

**Objetivo:** permitir pesquisar uma cidade, selecioná-la e consultar dados meteorológicos reais.

**Tarefas:** `T-06`, `T-07`, `T-08`, `T-09`, `T-12`, `T-13`, `T-21`.

**Entrega observável:** input, validação, resultados de geocoding, cidades homônimas, seleção, clima atual e previsão de cinco dias.

### Fatia 3 — Resiliência e cobertura automatizada

**Objetivo:** proteger o comportamento integrado e os casos de falha.

**Tarefas:** `T-22`, `T-23`, `T-24`, `T-25`, `T-26`, `T-27`, `T-28`, `T-29`, `T-30`.

**Entrega observável:** suíte Vitest cobrindo funções puras, services com mock de `fetch`, componentes, estados, retry e concorrência.

### Fatia 4 — Entrega validada em navegador

**Objetivo:** validar o fluxo principal e a qualidade do MVP.

**Tarefas:** `T-31`.

**Entrega observável:** fluxo E2E funcionando em desktop e mobile, com métricas de performance, acessibilidade e comandos de qualidade aprovados.

## Ordem resumida

```text
T-01 → T-02/T-04/T-05 → T-03 → T-06/T-07/T-08 → T-09
  └→ T-10/T-11/T-12/T-13/T-14/T-15/T-16/T-17/T-18/T-19/T-20
      └→ T-21 → T-22/T-23/T-24/T-25/T-26/T-27/T-28/T-29/T-30 → T-31
```