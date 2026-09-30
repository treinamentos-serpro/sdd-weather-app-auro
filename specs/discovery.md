# Discovery — Weather App

## Contexto

A empresa deseja disponibilizar uma aplicação web de previsão do tempo para usuários que precisam consultar o clima de cidades com rapidez e clareza. O produto deve atender ao cenário de uso diário, incluindo consulta ao clima atual, planejamento de atividades e comparação de temperatura em diferentes unidades.

O briefing indica que os usuários devem poder:
- buscar cidades
- ver o clima atual
- consultar a previsão de 5 dias
- alternar entre Celsius e Fahrenheit
- usar a aplicação em dispositivos móveis

O principal objetivo do produto é entregar uma experiência simples, responsiva e útil, com foco em velocidade de uso e clareza na apresentação das informações meteorológicas.

## Personas

### 1. Viajante em trânsito

- **Objetivo principal:** decidir rapidamente como se vestir e se precisa levar guarda-chuva antes de sair.
- **Contexto de uso:** mobile, em movimento e com pouco tempo disponível.
- **Métrica de sucesso:** consultar o clima atual e a previsão de 5 dias em poucos segundos e tomar uma decisão sem realizar buscas adicionais.

### 2. Pessoa com rotina diária

- **Objetivo principal:** acompanhar o clima da cidade onde vive para planejar roupas, deslocamentos e atividades do dia.
- **Contexto de uso:** mobile e desktop, em consultas rápidas ao longo do dia.
- **Métrica de sucesso:** identificar rapidamente a temperatura e as condições previstas sem precisar interpretar informações confusas.

### 3. Planejador de viagem

- **Objetivo principal:** consultar o clima de uma cidade de destino antes de uma viagem ou atividade planejada.
- **Contexto de uso:** principalmente desktop durante a pesquisa; mobile durante a viagem.
- **Métrica de sucesso:** buscar uma cidade e compreender a previsão do período relevante sem confundir localização ou unidade de temperatura.

## Requisitos Funcionais

1. Busca de cidades
- O usuário deve conseguir procurar uma cidade pelo nome.
- O sistema deve localizar a cidade informada e apresentar um resultado relevante.

2. Visualização do clima atual
- O sistema deve mostrar as condições do clima atual da cidade selecionada.
- A interface deve apresentar informações essenciais, como temperatura e descrição do clima.

3. Previsão de 5 dias
- O sistema deve disponibilizar a previsão meteorológica para os próximos 5 dias.
- A previsão deve ser exibida de forma legível e organizada.

4. Alternância entre Celsius e Fahrenheit
- O usuário deve poder trocar a unidade de temperatura entre °C e °F.
- A mudança de unidade deve refletir imediatamente na interface.

5. Tratamento de erro e estados vazios
- O sistema deve lidar com buscas vazias, cidades inexistentes e ausência de dados com feedback adequado ao usuário.

6. Feedback de carregamento
- O usuário deve receber indicação visual enquanto a aplicação busca ou carrega dados meteorológicos.

## Requisitos Não-Funcionais

1. Responsividade
- A aplicação deve se adaptar a diferentes tamanhos de tela sem quebrar o layout.

2. Performance
- A busca e a renderização devem acontecer com baixa latência.
- O usuário deve receber feedback visual de carregamento quando necessário.

3. Acessibilidade
- A interface deve ser legível e navegável por teclado e assistentes de leitura.
- Botões, campos e textos devem ser claros e semanticamente corretos.

4. Disponibilidade
- A aplicação deve responder com elegância mesmo quando houver falha temporária da rede ou da API externa.

5. Usabilidade
- A interação deve ser intuitiva e simples, mesmo para um usuário novo.

6. Compatibilidade
- A aplicação deve funcionar em navegadores modernos e em diferentes tipos de dispositivos.

7. Mobile-first / uso em dispositivos móveis
- A experiência deve ser otimizada para uso em smartphones e tablets.
- A interface deve manter legibilidade, navegação e funcionalidade em telas pequenas.

## Riscos

| Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- |
| Falha ou indisponibilidade da API de clima | Alta | Alto | Implementar tratamento de erro, exibir mensagens claras e manter estados de carregamento/erro consistentes. |
| Limite de requisições ou rate limiting da API | Média | Médio | Reduzir chamadas redundantes, evitar buscas repetidas e usar cache simples quando aplicável. |
| Busca de cidade ambígua ou incompleta | Média | Alto | Exibir resultados relevantes, validar entradas e permitir refinamento da busca. |
| Dados meteorológicos incompletos ou inconsistentes | Média | Médio | Tratar ausência de dados com estados vazios e avisos claros, sem quebrar a interface. |
| Experiência frágil em dispositivos móveis | Média | Alto | Priorizar design responsivo, testar em telas pequenas e manter interações simples. |
| Conversão de temperatura inconsistente | Baixa | Médio | Centralizar a lógica de conversão em função utilitária e validar a apresentação em °C/°F. |
| Latência alta na resposta da API | Média | Médio | Exibir carregamento, otimizar chamadas e reduzir processamento desnecessário no front-end. |
| Falta de clareza na UX em caso de erro | Média | Médio | Garantir mensagens amigáveis, feedback visual e estados explícitos para falha e ausência de dados. |
| Dependência de rede estável | Alta | Médio | Tratar offline e falha de rede com feedback claro; evitar quebrar a aplicação em cenários limites. |
| Requisitos pouco definidos em produto | Média | Alto | Fechar decisões de escopo antes da implementação, com discovery e especificação bem documentados. |

## Perguntas em Aberto

1. Qual é a fonte de dados meteorológicos e ela exige chave de API?
- Impacto: afeta arquitetura, custos e implementação.

2. A previsão de 5 dias inclui o dia atual ou começa no próximo dia?
- Impacto: muda a interpretação do requisito e o comportamento da interface.

3. A busca deve aceitar apenas cidades ou também localidades mais específicas?
- Impacto: altera a lógica de busca e resultados.

4. A aplicação deve usar geolocalização automática?
- Impacto: adiciona permissões, UX e complexidade de implementação.

5. A interface deve ter suporte a múltiplos idiomas?
- Impacto: afeta textos, labels e testes de usabilidade.

6. A aplicação deve salvar histórico de buscas?
- Impacto: exige persistência e altera o escopo do produto.

7. O que acontece quando a API falha ou demora a responder?
- Impacto: define a experiência em cenários de rede ruim.

8. A aplicação precisa funcionar offline ou com cache local?
- Impacto: aumenta o escopo técnico e o esforço de implementação.

## Suposições

1. A aplicação será entregue como um front-end web responsivo.
2. A fonte de dados será uma API pública sem exigência de autenticação do usuário.
3. A funcionalidade principal será a consulta de clima, sem login ou cadastro.
4. O foco principal será em uso mobile, pela natureza do consumo rápido de informações.
5. A previsão de 5 dias será apresentada como conjunto diário, sem necessidade de dados horários detalhados.
6. A conversão de temperatura será tratada na camada de apresentação.
7. Os estados de carregamento, erro e vazio serão explicitamente apresentados.
8. O produto deve priorizar simplicidade, clareza e baixo atrito na experiência do usuário.

## Decisões

1. Fonte de dados: Open-Meteo (sem API key)
- Justificativa: é uma API pública, gratuita e suficiente para o escopo do aplicativo, sem exigir autenticação do usuário.
- Resolve: ambiguidade sobre a origem dos dados e sobre custo/complexidade de integração.

2. "5 dias" = hoje + 4 dias seguintes
- Justificativa: padroniza a previsão em um intervalo compreensível e alinhado ao uso comum de previsão meteorológica diária.
- Resolve: ambiguidade sobre a contagem do período de previsão.

3. Buscar apenas cidades
- Justificativa: o escopo inicial será focado em consultar cidades, sem abranger bairros, regiões ou localidades muito específicas.
- Resolve: ambiguidade sobre o tipo de entidade de busca.

4. Não utilizar localização automática
- Justificativa: o produto inicial prioriza busca manual por cidade, evitando permissões e complexidade em geolocalização.
- Resolve: ambiguidade sobre geolocalização automática e privacidade.

5. Unidade padrão: Celsius
- Justificativa: é a unidade mais comum em contextos de clima e facilita a experiência inicial para a maioria dos usuários.
- Resolve: definição do padrão de temperatura e a necessidade de alternância entre unidades.

6. Não precisa salvar histórico
- Justificativa: o MVP prioriza consulta imediata do clima, sem persistência de histórico ou preferências do usuário.
- Resolve: ambiguidade sobre persistência local e armazenamento de dados.

7. Sem autenticação e sem persistência de servidor
- Justificativa: o projeto é front-end e focado em consulta de clima, sem necessidade de login ou armazenamento de dados sensíveis.
- Resolve: ambiguidade sobre conta de usuário e backend.

8. Idioma da interface: pt-BR
- Justificativa: o treinamento e a aplicação serão entregues em português do Brasil, alinhando com a documentação do projeto e com o público alvo.
- Resolve: ambiguidade sobre linguagem da interface e textos do produto.
