# Weather App — Especificação de Produto

## Overview

O Weather App é uma aplicação web responsiva para consulta rápida do clima de cidades. O usuário poderá buscar uma cidade, visualizar as condições atuais, consultar a previsão de 5 dias e alternar a unidade de temperatura entre Celsius e Fahrenheit.

A solução será voltada principalmente para uso mobile, mas também deverá oferecer uma experiência adequada em desktop. A interface será apresentada em pt-BR, usará Celsius como unidade padrão e não exigirá autenticação, geolocalização automática ou salvamento de histórico.

A fonte de dados definida para o produto é a Open-Meteo, sem necessidade de API key. A previsão de 5 dias significa hoje e os quatro dias seguintes.

As datas e horários exibidos devem usar o fuso horário da cidade selecionada, conforme retornado pela fonte de dados. A data atual da previsão é a primeira data retornada para esse fuso, não a data local do dispositivo do usuário.

O produto usará a API de geocoding da Open-Meteo para localizar cidades e a API de previsão da Open-Meteo para obter os dados meteorológicos. A aplicação fará as consultas diretamente do navegador, sem camada intermediária no MVP.

## Functional Requirements

### FR-01 — Buscar cidades

O usuário deve poder informar o nome de uma cidade e iniciar uma busca. O escopo da busca é limitado a cidades, sem busca automática por localização do usuário. O sistema deve remover espaços no início e no fim da entrada e não deve consultar a API para entradas vazias ou compostas apenas por símbolos.

### FR-02 — Selecionar uma cidade

Quando a busca retornar uma ou mais cidades compatíveis, o usuário deve poder identificar e selecionar a cidade desejada antes de consultar seus dados meteorológicos. Cada resultado deve exibir cidade, região/estado e país quando esses dados estiverem disponíveis.

### FR-03 — Exibir o clima atual

Após a seleção de uma cidade e o carregamento dos dados, o sistema deve exibir cidade, temperatura atual, unidade utilizada, condição meteorológica e data/hora da medição. País e região devem ser exibidos quando retornados pela fonte. Temperatura, unidade e condição meteorológica são dados obrigatórios para o estado de sucesso; se algum deles faltar, o sistema deve usar o estado de dados insuficientes.

### FR-04 — Exibir previsão de 5 dias

O sistema deve exibir exatamente cinco entradas diárias para hoje e os quatro dias seguintes. Cada entrada deve conter data, temperatura máxima e temperatura mínima. A condição meteorológica deve ser exibida quando disponível e, quando ausente, deve ser identificada como indisponível. Uma entrada sem data ou sem as temperaturas máxima e mínima não pode ser apresentada como previsão válida.

### FR-05 — Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit. A unidade padrão ao iniciar a aplicação deve ser Celsius. As temperaturas devem ser exibidas arredondadas para o inteiro mais próximo, com a unidade explícita.

### FR-06 — Tratar carregamento

Enquanto uma busca ou consulta meteorológica estiver em andamento, o sistema deve apresentar um estado visual de carregamento e evitar comunicar que a operação foi concluída antes da resposta. Se uma nova busca começar antes da anterior terminar, apenas a resposta da busca mais recente poderá atualizar a interface.

### FR-07 — Tratar busca inválida ou sem resultados

O sistema deve informar o usuário quando a busca estiver vazia, for inválida ou não encontrar uma cidade compatível, sem exibir dados meteorológicos de uma consulta anterior como se fossem resultado da nova busca. A busca deve aceitar acentos, hífens e apóstrofos legítimos em nomes de cidades, normalizar espaços excedentes e rejeitar entradas compostas apenas por símbolos.

### FR-08 — Tratar ausência de dados meteorológicos

Se a cidade for encontrada, mas a resposta não contiver dados suficientes para o clima atual ou a previsão, o sistema deve exibir um estado vazio ou uma mensagem explicativa sem quebrar a interface. Se apenas um campo não crítico estiver ausente, deve exibir os dados válidos e indicar o campo indisponível; se faltar temperatura ou data, deve exibir estado de dados insuficientes.

### FR-09 — Tratar falhas de consulta

Quando a rede ou a API Open-Meteo falhar, o sistema deve exibir uma mensagem de erro compreensível e manter a aplicação utilizável para uma nova tentativa. Falhas de geocoding, falhas de previsão, timeout e limite de requisições devem encerrar o carregamento, não reutilizar dados antigos como resultado atual e permitir nova tentativa.

### FR-10 — Usar dados de hoje e dos quatro dias seguintes

A consulta deve representar explicitamente o intervalo definido como “5 dias”: o dia atual mais os quatro dias seguintes.

## User Stories

### US-01 — Consulta rápida no deslocamento

Como viajante em trânsito, quero buscar uma cidade e ver rapidamente o clima atual para decidir como me vestir e se preciso levar guarda-chuva.

- **Requisitos funcionais relacionados:** FR-01, FR-02 e FR-03.

### US-02 — Planejamento da rotina

Como pessoa com rotina diária, quero consultar a temperatura e a previsão da minha cidade para planejar roupas, deslocamentos e atividades.

- **Requisitos funcionais relacionados:** FR-03 e FR-04.

### US-03 — Planejamento de viagem

Como planejador de viagem, quero buscar uma cidade de destino e consultar sua previsão de 5 dias para avaliar o período da viagem.

- **Requisitos funcionais relacionados:** FR-01, FR-02, FR-04 e FR-10.

### US-04 — Preferência de unidade

Como viajante em trânsito, quero alternar entre Celsius e Fahrenheit para interpretar a temperatura com facilidade durante a viagem.

- **Requisitos funcionais relacionados:** FR-05.

### US-05 — Recuperação de falhas

Como pessoa com rotina diária, quero receber uma mensagem clara quando a busca não encontrar uma cidade ou quando a consulta falhar para saber como continuar.

- **Requisitos funcionais relacionados:** FR-06, FR-07, FR-08 e FR-09.

## Acceptance Criteria

### AC-01 — FR-01: buscar cidades

- **Given** que o usuário informa o nome de uma cidade válida
- **When** inicia a busca
- **Then** o sistema apresenta pelo menos um resultado de cidade compatível para seleção.

### AC-01b — FR-01: normalizar entrada

- **Given** que o usuário informa uma cidade com espaços excedentes no início ou no fim
- **When** inicia a busca
- **Then** o sistema remove os espaços excedentes antes de consultar a fonte de dados.

### AC-02 — FR-02: selecionar uma cidade

- **Given** que a busca apresenta uma ou mais cidades compatíveis
- **When** o usuário seleciona uma cidade
- **Then** o sistema identifica a cidade selecionada, exibe seus dados de localização disponíveis e inicia a consulta meteorológica correspondente.

### AC-02b — FR-02: diferenciar cidades homônimas

- **Given** que a busca retorna duas ou mais cidades com o mesmo nome
- **When** o sistema apresenta os resultados
- **Then** cada resultado exibe cidade, região/estado e país quando disponíveis, permitindo uma seleção inequívoca.

### AC-03 — FR-03: exibir o clima atual

- **Given** que o usuário selecionou uma cidade com dados disponíveis
- **When** a consulta termina com sucesso
- **Then** o sistema exibe cidade, temperatura atual, unidade, condição meteorológica e data/hora da consulta, além de país e região quando disponíveis.

### AC-03b — FR-03: rejeitar clima atual incompleto

- **Given** que a resposta não contém temperatura, unidade ou condição meteorológica
- **When** o sistema processa a resposta
- **Then** o sistema exibe o estado de dados insuficientes e não apresenta o resultado como clima atual válido.

### AC-04 — FR-04: exibir a previsão de 5 dias

- **Given** que o usuário selecionou uma cidade com previsão disponível
- **When** os dados são exibidos
- **Then** o sistema mostra exatamente cinco entradas, cada uma com data, temperatura máxima e temperatura mínima, além da condição meteorológica quando disponível.
- **And** nenhuma entrada sem data, temperatura máxima ou temperatura mínima é apresentada como previsão válida.

### AC-05 — FR-05: alternar unidade de temperatura

- **Given** que o clima atual e a previsão estão visíveis em Celsius
- **When** o usuário seleciona Fahrenheit
- **Then** o sistema exibe as temperaturas atuais e previstas arredondadas para o inteiro mais próximo em Fahrenheit, sem iniciar uma nova consulta meteorológica, mantendo a mesma cidade e previsão.

### AC-06 — FR-06: tratar carregamento

- **Given** que uma busca ou consulta meteorológica foi iniciada e ainda não terminou
- **When** o sistema aguarda a resposta
- **Then** o sistema exibe um indicador de carregamento e não apresenta a operação como concluída.

### AC-06b — FR-06: priorizar a busca mais recente

- **Given** que uma busca anterior ainda está em andamento
- **When** o usuário inicia uma nova busca
- **Then** somente a resposta da busca mais recente pode atualizar os resultados exibidos.

### AC-07 — FR-07: tratar busca inválida ou sem resultados

- **Given** que o campo de busca está vazio ou contém um nome sem cidade compatível
- **When** o usuário tenta pesquisar
- **Then** o sistema informa que a busca não produziu uma cidade válida, não chama a API para input vazio ou composto apenas por símbolos e não exibe dados meteorológicos incorretos.

### AC-08 — FR-08: tratar ausência de dados meteorológicos

- **Given** que uma cidade foi encontrada, mas a resposta não contém dados atuais ou de previsão suficientes
- **When** o sistema processa a resposta
- **Then** o sistema exibe os dados válidos com indicação dos campos indisponíveis ou um estado de dados insuficientes quando faltar temperatura ou data, sem renderizar valores ausentes como se fossem válidos.

### AC-09 — FR-09: tratar falhas de consulta

- **Given** que a rede ou a API Open-Meteo falha durante uma consulta
- **When** o sistema detecta o erro
- **Then** o sistema encerra o estado de carregamento, exibe a mensagem correspondente ao tipo de falha e disponibiliza uma nova tentativa.
- **And** o sistema não apresenta os dados da consulta anterior como resultado da consulta que falhou.

### AC-10 — FR-10: usar hoje e os quatro dias seguintes

- **Given** que o usuário selecionou uma cidade com previsão diária disponível
- **When** o sistema exibe a previsão de 5 dias
- **Then** as cinco entradas correspondem ao dia atual e aos quatro dias seguintes, nessa ordem.

### AC-11 — FR-07: aceitar caracteres de cidades

- **Given** que o usuário informa uma cidade com acentos, hífen ou apóstrofo válidos
- **When** inicia a busca
- **Then** o sistema preserva os caracteres válidos, normaliza espaços excedentes e realiza a busca.

### AC-12 — FR-09: tratar timeout

- **Given** que uma consulta não recebe resposta em até 10 segundos
- **When** o limite de tempo é atingido
- **Then** o sistema encerra o carregamento, informa que a consulta demorou e disponibiliza uma nova tentativa.

### AC-13 — FR-08: tratar resposta parcial

- **Given** que a resposta contém temperatura e data, mas não contém um campo não crítico, como descrição meteorológica
- **When** o sistema processa a resposta
- **Then** o sistema exibe temperatura e data, identifica o campo indisponível e não mostra valores nulos ou indefinidos.

### AC-14 — FR-08: rejeitar dados essenciais ausentes

- **Given** que a resposta não contém temperatura ou data para uma entrada meteorológica
- **When** o sistema processa a resposta
- **Then** o sistema exibe um estado de dados insuficientes e não renderiza aquela entrada como previsão válida.

## Non-Functional Requirements

### NFR-01 — Responsividade

A interface deve se adaptar aos viewports de 375 × 667, 768 × 1024 e 1440 × 900, mantendo a hierarquia visual, sem rolagem horizontal e sem quebrar os controles principais.

### NFR-02 — Performance percebida

A aplicação deve exibir o estado de carregamento em até 100 ms após o início de uma operação e deve renderizar os dados em até 2 segundos depois de receber uma resposta válida, sem processamento visual desnecessário. As medições devem ser feitas em build de produção, em viewport de 375 × 667 e conexão de rede regular de aproximadamente 10 Mbps.

### NFR-03 — Acessibilidade

A interface deve atender ao nível AA da WCAG 2.2: todos os controles devem ser operáveis por teclado, ter foco visível e nome acessível, e os textos e controles devem respeitar os contrastes mínimos aplicáveis.

### NFR-04 — Disponibilidade e resiliência

Falhas temporárias de rede ou da API não devem deixar a aplicação permanentemente bloqueada. O usuário deve receber feedback e poder iniciar uma nova tentativa.

### NFR-05 — Usabilidade

A busca, a seleção de cidade, a leitura da previsão e a alternância de unidade devem ser compreensíveis para usuários novos, sem depender de instruções externas.

### NFR-06 — Compatibilidade

A aplicação deve funcionar nas duas versões estáveis mais recentes dos navegadores Chrome, Firefox, Safari e Edge, além dos viewports definidos em NFR-01.

### NFR-07 — Consistência de dados

A unidade exibida deve ser consistente entre clima atual e previsão. A conversão deve preservar o valor meteorológico de origem e não introduzir nova consulta desnecessária.

### NFR-08 — Privacidade e minimização de dados

A aplicação não deve exigir conta, localização automática ou persistência de histórico para cumprir seu objetivo principal.

### NFR-09 — Idioma

Os textos da interface, mensagens de estado e rótulos dos controles devem estar em pt-BR.

### Critérios de aceite não-funcionais

#### NFR-AC-01 — Viewports suportados

- **Given** que a aplicação é aberta nos viewports 375 × 667, 768 × 1024 e 1440 × 900
- **When** o usuário executa uma busca e alterna a unidade
- **Then** não há rolagem horizontal, controles cortados ou perda de conteúdo essencial.

#### NFR-AC-02 — Performance de interface

- **Given** que o usuário inicia uma busca
- **When** a operação começa e depois recebe uma resposta válida
- **Then** o estado de carregamento aparece em até 100 ms e os dados são renderizados em até 2 segundos após a resposta.

#### NFR-AC-03 — Acessibilidade dos controles

- **Given** que o usuário acessa a aplicação apenas pelo teclado
- **When** navega pela busca, resultados e alternância de unidade
- **Then** todos os controles recebem foco visível, podem ser acionados e possuem nome acessível.

#### NFR-AC-04 — Mensagens em pt-BR

- **Given** que a aplicação apresenta qualquer estado de sucesso, carregamento, vazio ou erro
- **When** o usuário lê a interface
- **Then** os textos visíveis e rótulos dos controles estão em pt-BR.

## Traceability Matrix

| User Story | Acceptance Criteria relacionados | Requisitos não-funcionais relevantes |
| --- | --- | --- |
| US-01 — Consulta rápida no deslocamento | AC-01, AC-01b, AC-02, AC-02b, AC-03, AC-03b, AC-06, AC-07 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07, NFR-09 |
| US-02 — Planejamento da rotina | AC-03, AC-03b, AC-04, AC-08, AC-10, AC-13, AC-14 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07, NFR-09 |
| US-03 — Planejamento de viagem | AC-01, AC-01b, AC-02, AC-02b, AC-04, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07, NFR-09 |
| US-04 — Preferência de unidade | AC-05 | NFR-01, NFR-03, NFR-05, NFR-06, NFR-07, NFR-09 |
| US-05 — Recuperação de falhas | AC-06, AC-06b, AC-07, AC-08, AC-09, AC-12, AC-13, AC-14 | NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-09 |

## Edge Cases

- **Input vazio:** quando o usuário envia uma busca vazia ou composta apenas por espaços, a aplicação deve impedir a consulta, informar que o nome da cidade é obrigatório e manter o campo disponível para correção.
- **Cidade inexistente:** quando não há cidade compatível com o termo informado, a aplicação deve exibir uma mensagem de “cidade não encontrada”, limpar o carregamento e permitir uma nova busca sem mostrar dados anteriores como resultado atual.
- **Caracteres especiais:** a aplicação deve aceitar acentos, hífens e apóstrofos legítimos em nomes de cidades, normalizar espaços excedentes e rejeitar entradas compostas apenas por símbolos sem chamar a API.
- **Geocoding sem resultados:** quando o serviço de geocodificação não retornar resultados, a aplicação deve exibir um estado vazio específico, não iniciar a consulta meteorológica e permitir que o usuário pesquise novamente.
- **Falha de API:** quando a API de geocodificação ou meteorológica falhar, a aplicação deve encerrar o estado de carregamento, exibir uma mensagem de erro em pt-BR específica para a falha e disponibilizar uma nova tentativa.
- **Timeout:** quando a API não responder em até 10 segundos, a aplicação deve interromper a espera, informar que a consulta demorou e permitir uma nova tentativa.
- **Resposta parcial:** quando a API retornar temperatura e data, mas não um campo não crítico, a aplicação deve exibir os dados válidos e indicar o campo indisponível; se faltar temperatura ou data, deve exibir estado de dados insuficientes.
- **Cidades homônimas:** quando a busca retornar várias cidades com o mesmo nome, cada resultado deve mostrar cidade, região/estado e país quando disponíveis para permitir a seleção correta.
- A API de geocodificação responde com formato inesperado.
- A API retorna temperaturas nulas, ausentes ou fora do formato esperado.
- A previsão retorna menos de cinco dias.
- O usuário alterna a unidade enquanto os dados ainda estão carregando.
- O usuário alterna a unidade várias vezes rapidamente.
- A rede cai depois que a cidade foi selecionada.
- O usuário inicia uma nova busca enquanto a anterior ainda está carregando.
- O usuário acessa a aplicação em uma tela estreita ou com zoom elevado.
- O usuário navega pelos controles apenas com o teclado.
- A API aplica limite de requisições.
- A API retorna dados válidos, mas sem uma descrição meteorológica disponível.

## Assumptions

- A fonte de dados será a Open-Meteo e não exigirá API key para o escopo do produto.
- “5 dias” representa hoje e os quatro dias seguintes, em visão diária.
- Celsius será a unidade padrão; Fahrenheit estará disponível como alternativa.
- A busca será manual e limitada a cidades.
- Não haverá geolocalização automática.
- Não haverá autenticação, conta de usuário ou persistência de servidor.
- O histórico de buscas não será salvo.
- A interface será disponibilizada em pt-BR.
- O produto será uma aplicação web front-end responsiva.
- As consultas à Open-Meteo serão feitas diretamente pelo navegador no MVP, sem proxy ou backend intermediário.
- O usuário terá acesso à internet durante a consulta; falhas de rede serão tratadas, mas o produto não terá modo offline definido como requisito.
- Os dados climáticos serão usados para consulta informativa, sem promessa de precisão superior à fornecida pela fonte externa.
- O timeout de consultas será de 10 segundos.
- Durante uma falha, a aplicação exibirá o estado de erro em vez de apresentar dados antigos como se fossem resultado da nova busca.
- Em buscas concorrentes, a resposta da busca mais recente terá precedência sobre respostas anteriores.
- Datas serão exibidas em formato pt-BR (`dd/MM`) e horários em formato de 24 horas (`HH:mm`), sempre no fuso da cidade selecionada.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Falha ou indisponibilidade da Open-Meteo | Alta | Alto | Exibir erro compreensível, encerrar o carregamento e permitir nova tentativa. |
| Limite de requisições ou rate limiting | Média | Médio | Evitar chamadas redundantes, controlar novas buscas e considerar cache em memória. |
| Cidade ambígua ou resultado incorreto | Média | Alto | Apresentar opções identificáveis, incluindo informações de localização disponíveis. |
| Dados meteorológicos incompletos | Média | Médio | Validar os dados antes da apresentação e usar estados vazios para informações ausentes. |
| Latência elevada | Média | Médio | Mostrar carregamento, manter a UI responsiva e evitar processamento desnecessário. |
| Layout inadequado em mobile | Média | Alto | Adotar abordagem mobile-first e validar em viewports pequenos e grandes. |
| Conversão de temperatura incorreta | Baixa | Médio | Centralizar a regra de conversão e cobrir Celsius/Fahrenheit com testes. |
| Ausência de dados durante uma falha de rede | Média | Médio | Exibir erro, não reutilizar dados antigos como resultado atual e permitir nova tentativa. |

## Out of Scope

- Geolocalização automática do usuário.
- Busca por bairros, regiões, endereços ou pontos de interesse que não sejam cidades.
- Login, cadastro, autenticação e perfis de usuário.
- Persistência de histórico de buscas ou cidades favoritas.
- Backend próprio ou banco de dados de usuários.
- Alertas meteorológicos e notificações push.
- Previsão horária detalhada.
- Modo offline completo ou garantia de atualização sem conexão.
- Integração com múltiplas fontes meteorológicas.
- Personalização avançada da interface.
- Comparação lado a lado de várias cidades na mesma tela.
- Atualização automática periódica do clima.
- Compartilhamento, exportação ou impressão de previsões.
- Mapas meteorológicos, radar e imagens de satélite.
- Dados históricos ou comparação com períodos anteriores.
- Suporte a idiomas diferentes de pt-BR.
- Notificações por e-mail, push ou SMS.

## Open Questions

As decisões de produto e de integração do MVP foram fechadas. Uma camada intermediária poderá ser avaliada em uma evolução futura caso os limites de uso, requisitos de segurança ou observabilidade exijam essa mudança.
