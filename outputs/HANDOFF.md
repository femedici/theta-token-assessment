> **Submission update — 18 November 2026:** the user subsequently authorized a separate personal GitHub repository: https://github.com/femedici/theta-token-assessment (private), branch `codex/assessment-submission`. The root README is now the current English reviewer guide; the original brief is preserved verbatim in `docs/ASSESSMENT.md`. Fresh validation passed: 48 feature tests, 2 startup-safety tests and the production build. The notes below describe the original local handoff; their no-push restriction applies to the starter repository, which remains unchanged.

# Assessment — implementação e roteiro de demonstração

Data: 18/11/2026. Projeto: `test_assessment_v1`.

## Resultado e localização

**Aplicação local:** http://127.0.0.1:3000 — iniciada e mantida em execução para teste.

**Código:** `/Users/felipemedici/Documents/ChatGPT/JOB/test_assessment_v1`.

**Branch integrada:** `agent/token-selection`. A entrega está na estrutura React, Redux, Redux Saga, Axios, MUI e TradingView fornecida. Não foram excluídos arquivos originais da aplicação nem adicionadas dependências de runtime.

O botão **Select token**, no extremo direito da faixa de tokens abaixo do cabeçalho, abre a seleção. Clicar no nome de um token atualiza detalhes, histórico e swaps. Os nomes na faixa dos tokens mais ativos também permitem seleção direta. A aplicação inicia sem escolher um token automaticamente.

Validação final: **48 testes em 10 suítes + 2 testes de startup aprovados; lint sem erros/avisos nos arquivos de produção da feature; build de produção aprovado; diff sem problemas de whitespace**. Fluxo também validado com APIs reais em desktop e viewport móvel de 390 × 844.

O usuário pediu explicitamente **não gravar**. Nenhum vídeo foi produzido. Este documento contém o roteiro para sua própria gravação. Nenhum push, PR, deploy ou envio externo foi realizado: o README proíbe push para o repositório de origem.

## Pedido e decisões preservadas

Pedido original: implementar exatamente a avaliação do README, dentro da estrutura existente, com qualidade de desenvolvimento sênior, arquitetura simples, interface refinada e justificativa do uso de APIs; executar localmente e explicar o que foi feito, onde, como e por quê.

**Pedido otimizado:** implementar a seleção de tokens já prevista na aplicação para que uma única seleção por endereço de contrato controle todos os dados exibidos; preservar a base e os recursos existentes, sem funcionalidades extras; validar comportamento, dados, concorrência, acessibilidade básica e responsividade; deixar a aplicação local pronta e entregar instruções técnicas para demonstração.

Decisões: não usar Spec Kit; preservar a base; não gravar; entregar roteiro com botões, payloads, dados e estrutura. O tracker está em `docs/plans/task.md`; o plano em `docs/plans/2026-11-18-token-selection.md`.

## Roteiro para gravar

### 1. Ponto de entrada

Abra http://127.0.0.1:3000. Recarregue a página se quiser começar sem token selecionado.

Fala sugerida: “Mantive a estrutura fornecida e implementei o requisito central: selecionar um token e atualizar todos os dados relacionados a ele. A tela inicial pede uma seleção em vez de mostrar dados de demonstração como se fossem reais.”

### 2. Botão à direita e seleção

Clique em **Select token**, no lado direito da faixa superior. No campo **Search name, symbol or contract address**, digite **TDROP**. Clique no nome **TDROP / TDrop Token**.

O modal fecha e três áreas são atualizadas:

- **Painel direito:** identidade, preço USD e cotação TFUEL, liquidez, volume e transações de 24h, totais, contrato e pools.
- **Price history**, à esquerda: fechamento diário em TFUEL no TradingView já fornecido.
- **Recent swaps**, abaixo: compras/vendas do token, quantidades, contraparte, valor USD, horário e link para a transação.

Fala sugerida: “A identidade é o endereço do contrato. Nome e símbolo são apresentação; o contrato é a chave das requisições e da validação das respostas.”

### 3. Busca, ordenação, teclado e pools

Abra novamente o seletor. Busque por nome, símbolo ou contrato. Clique nos cabeçalhos **Liquidity** ou **Volume · 24h** para ordenar. Uma busca inexistente mostra **No tokens match your search**. `Escape` fecha o modal; os botões também aceitam seleção por teclado.

No painel direito, expanda **Liquidity pools** para ver pares e liquidez em USD. O contrato, os pools e cada transação possuem links para o Theta Explorer. **Hide details / Show details** recolhe ou reabre o painel lateral.

Fala sugerida: “Reutilizei o modal do MUI para foco, fechamento por Escape e navegação por teclado. A ordenação usa uma cópia dos dados, preservando o estado do Redux.”

### 4. Troca de contexto

Escolha **WTHETA / Wrapped Theta**, depois volte para **TDROP**. Você também pode clicar diretamente nos nomes da faixa superior.

Fala sugerida: “A troca limpa os resultados anteriores. As requisições antigas são canceladas e os reducers conferem contrato e identificador da tentativa. Assim, uma resposta atrasada de TDROP não aparece na tela de WTHETA.”

Mostre um swap entre TDROP e WTHETA: a perspectiva muda conforme o token selecionado. Comprar TDROP significa vender WTHETA nesse par.

### 5. Fidelidade do histórico e celular

Selecione **TBILL / ThetaCash** se quiser demonstrar histórico antigo. Durante a validação, o último ponto disponível era de **21/02/2023**, e a tela mostrou essa data. Esse é um resultado observado, não garantia sobre respostas futuras da API.

Fala sugerida: “O gráfico informa a última data disponível. O campo priceETH é um nome legado, mas representa TFUEL nesta API. Não inventei candles, dias sem dados, market cap ou variações percentuais.”

No modo móvel do navegador, o resumo passa para cima do gráfico, o seletor continua disponível e as tabelas têm rolagem própria. Use **Hide details** para visualizar o gráfico sem o resumo no celular.

### 6. Código e arquitetura

Mostre `src/utils/tokenApi.js`, `src/redux/actions/tokenAction.js`, `src/redux/sagas/tokenSaga.js`, `src/redux/reducers/tokenReducer.js` e `src/components/MainComponent.jsx`.

Fala sugerida: “Reutilizei Redux Saga e Axios. Separei acesso e validação de dados da apresentação. O MainComponent compõe os três painéis a partir da mesma seleção. Não criei backend, banco, webhook ou websocket porque o requisito é consultar dados públicos quando o usuário escolhe um token.”

### 7. Testes

Fala sugerida: “A implementação passou em 48 testes da feature, dois de startup, lint e build. Os testes cobrem seleção, integração Redux/Saga, respostas atrasadas, cancelamento, dados inválidos, erros, estados vazios e o adaptador do gráfico. Também testei a tela com APIs reais em desktop e celular.”

## Fluxo de dados

```text
TokenList / TopTokenList / TokenRow
  → dispatch(selectToken(contractAddress))
  → Redux: selectedTokenId + requestId
  → Saga: detalhes | histórico | swaps, independentemente
  → Axios + validação em tokenApi.js
  → reducers aceitam somente a tentativa e o contrato atuais
  → MainComponent
      ├─ TokenSummary
      ├─ TVChartContainer → tokenChartDatafeed → TradingView existente
      └─ Table → getSwapView / formatadores
```

Exemplo da action Redux; `requestId` incrementa em cada seleção/retry:

```json
{
  "type": "SELECT_TOKEN",
  "payload": "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03",
  "requestId": 1
}
```

## APIs, payloads e dados

| Método e URL | Uso | Resposta consumida |
|---|---|---|
| `GET https://swap-api.thetatoken.org/swap/top-tokens` | Catálogo e resumo inicial | `body.tokens[]` |
| `GET https://assets.thetatoken.org/wallet-metadata/v1/data.json` | Logos opcionais | `mainnet.tokens[address].logo` |
| `GET https://swap-api.thetatoken.org/swap/token/{address}` | Detalhes e pools | `body.tokens[]`, `body.pairs[]` |
| `GET https://swap-api.thetatoken.org/swap/token/{address}/transactions` | Atividade recente | `body.transactions[]` |
| `POST https://swap-api.thetatoken.org/graph/generic` | Histórico diário | `graph.data.tokenDayDatas[]` |

Os GETs não enviam corpo. Endereços são validados como `0x` + 40 caracteres hexadecimais e normalizados para minúsculas. Não são enviadas credenciais privadas nem transações financeiras. Imagens usam o nome de arquivo validado da metadata em `https://assets.thetatoken.org/tokens/{logo}`.

Payload GraphQL, equivalente exato com espaços normalizados:

```json
{
  "query": "query tokenDayDatas($tokenAddr: String!) { tokenDayDatas(first: 365, orderBy: date, orderDirection: desc, where: { token: $tokenAddr }) { id date priceETH } }",
  "variables": {
    "tokenAddr": "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03"
  }
}
```

Cada registro de histórico possui `{ id, date, priceETH }`. `date` vem em segundos e vira milissegundos; `priceETH` vira `value` numérico em TFUEL. O frontend normaliza para `{ time, value }`, valida contrato/datas/números, deduplica e ordena. A taxa atual `tfuel_price`, quando presente, não é usada para fabricar USD histórico.

| Informação na tela | Campo da API | Unidade / significado |
|---|---|---|
| Identidade | `name`, `symbol`, `id` | Nome, símbolo, contrato |
| Preço USD | `derivedUSD` | Preço atual informado em dólares |
| Cotação TFUEL | `derivedETH` | TFUEL, apesar do nome legado |
| Liquidez | `totalLiquidityUSD` | USD |
| Volume de 24h | `volume24HrsUSD` | USD |
| Transações de 24h | `txCount24Hrs` | Contagem |
| Volume total | `tradeVolumeUSD` | Acumulado em USD; não market cap |
| Total de transações | `txCount` | Contagem acumulada |
| Liquidez em tokens | `totalLiquidity` | Quantidade do token |
| Quantidade negociada | `tradeVolume` | Quantidade acumulada do token |
| Pools | `id`, `token0`, `token1`, `reserveUSD` | Par, contrato e liquidez USD |
| Horário do swap | `timestamp` | Segundos → horário local do navegador |
| Quantidades | `amount0In/Out`, `amount1In/Out` | Quantidades por posição do pool |
| Valor do swap | `amountUSD` | USD |

A tabela mostra somente `type === "Swap"` do contrato selecionado. Mint/Burn não aparecem como compras/vendas. Entrada do token no pool significa **Sell**; saída significa **Buy**.

Uma inconsistência real da API foi reproduzida e corrigida: `symbol0/symbol1` seguem a direção da troca, enquanto quantidades seguem token0/token1 do pool. O frontend resolve símbolos por endereço usando o token escolhido, catálogo e pares. Se faltar símbolo confiável, mostra o endereço abreviado. Exemplo observado: compra de aproximadamente 11.720,779152 TDROP por 27,620937 WTHETA; ao selecionar WTHETA, a mesma troca aparece como venda de WTHETA.

## Arquivos alterados: onde, como e por quê

Caminhos relativos à raiz local informada no início:

| Arquivos | Responsabilidade |
|---|---|
| `src/components/TokenList.jsx` | Botão à direita, modal, busca, seleção, estados e retry |
| `src/components/TokenTable.jsx`, `common/TokenRow.jsx` | Colunas corretas, ordenação imutável, seleção acessível pelo nome |
| `src/components/common/TopTokenList.jsx`, `TopToken.jsx` | Faixa superior com preços reais e seleção direta |
| `src/components/MainComponent.jsx` | Compõe os três painéis com a mesma seleção; mantém recolhimento lateral |
| `src/components/TokenSummary.jsx` | Métricas, unidades, contrato, pools e estados de detalhes |
| `src/components/Table.jsx` | Swaps do token, direção, quantidades, horários e explorer |
| `src/components/common/TokenIcon.jsx` | Logo opcional com fallback de iniciais |
| `src/components/common/TVChartContainer.jsx` | TradingView existente conectado ao token, estados e cleanup do widget |
| `src/utils/tokenChartDatafeed.js` | Adapta pontos reais, restringe a fechamento diário, cancela callbacks e ajusta precisão visual sem arredondar os valores de origem |
| `src/utils/tokenApi.js` | URLs, timeouts, validação e transformação das respostas |
| `src/utils/tokenFormat.js` | Dinheiro, quantidades e perspectiva do swap; inválido não vira zero |
| `src/redux/actions/tokenAction.js`, `fetchSwapTrasactionAction.js` | Seleção, identificador de tentativa e resultados identificados por contrato |
| `src/redux/reducers/tokenReducer.js`, `fetchSwapTransactionReducer.js` | Estado por recurso e rejeição de respostas antigas |
| `src/redux/sagas/tokenSaga.js`, `fetchSwapTransactionSaga.js` | Buscas independentes com `takeLatest` e cancelamento HTTP |
| `src/components/style.css`, `src/App.css`, `src/index.css` | Hierarquia visual, espaçamento, foco, modal, tabelas e responsividade |
| `public/index.html` | Bootstrap legado preservado como texto inerte; React é o único dono do gráfico, evitando inicialização duplicada |
| `src/App.test.js`, testes em componentes/redux/utils | Comportamento e integração real Redux/Saga com APIs simuladas |
| `tests/startup-safety.test.cjs` | Regressão contra execução remota em instalação, terminal e import do servidor |
| `.npmrc`, `package.json`, `package-lock.json` | Instalação reproduzível, scripts automáticos desabilitados, frontend independente do backend legado |
| `.vscode/settings.json`, `server/routes/api/profile.js` | Neutralização dos hooks de download/execução remota encontrados na base |
| `docs/reference/*`, `.gitattributes` | Originais exatos como texto inerte; whitespace original preservado somente nessas cópias arquivadas |
| `docs/plans/*`, `outputs/HANDOFF.md` | Plano, tracker, evidências e instruções desta entrega |

Cabeçalho, rodapé, assets, biblioteca de gráfico e estrutura do backend foram preservados. O pacote não utilizado `room-populate` e o `prepare` que iniciava código durante instalação saíram da configuração ativa; o manifesto original permanece em `docs/reference/original-package.json.txt` e no histórico Git. Os payloads remotos encontrados não foram executados nem baixados.

## Decisões técnicas

- **Contrato como identidade:** símbolos podem repetir. Endereço é a chave verificável.
- **Concorrência:** `takeLatest` + `AbortController`; reducers conferem endereço e `requestId`, inclusive quando se tenta o mesmo token novamente.
- **Estados independentes:** detalhe, histórico e swaps têm loading/erro próprios. Falhar o gráfico não elimina o resumo. Retry redispara a seleção e recarrega os três recursos.
- **Timeouts:** APIs em 20 segundos; metadata opcional em 5 segundos. Falha de logo não bloqueia catálogo.
- **Validação:** valores ausentes/inválidos viram `—`; zero continua zero. Símbolos malformados dos pools recebem fallback textual, evitando crash do React.
- **Histórico fiel:** até 365 observações disponíveis, não necessariamente 365 dias recentes. Linha diária em TFUEL, última data visível em UTC, sem preencher dias artificialmente.
- **TradingView:** a API não oferece OHLC real; o adaptador fornece os campos internos exigidos com o mesmo close, mas só disponibiliza a linha de fechamento. Não apresenta velas como se fossem dados reais nem atualização em tempo real.
- **Escopo:** não foi criado backend/webhook/websocket/banco, pois seleção de token exige leitura sob demanda. Nenhum recurso de trading ou wallet foi acrescentado.

## Evidências de validação final

| Verificação | Resultado observado |
|---|---|
| `CI=true npm test -- --watchAll=false --runInBand` | 10 suítes, 48 testes aprovados |
| `npm run test:safety` | 2 testes aprovados |
| `npm run build` | Compiled successfully; bundle principal 144,38 kB gzip |
| ESLint com config CRA nos 19 arquivos de produção alterados | Exit 0; sem erros/avisos |
| `git diff --check` | Exit 0 |
| Browser desktop e móvel | TDROP/WTHETA/TBILL; teclado; busca vazia; troca rápida; pools; recolhimento lateral; chart real; quantidades corretas |
| Largura móvel | Documento e viewport útil: ambos 385 px, dentro do viewport solicitado de 390 px com barra de rolagem |
| Revisão independente | Sem achados acionáveis remanescentes; ajuste posterior de precisão revisado pelo coordenador e coberto por 4 regressões |

RED→GREEN observado em seleção, gráfico, componentes, startup, símbolos de swaps, validação numérica, símbolos de pools e precisão do eixo. Logs locais da última rodada: `/tmp/assessment-delivery-tests.log` e `/tmp/assessment-delivery-build.log`; este documento preserva os resultados mesmo se os temporários forem removidos.

Avisos legados observados: `react-helmet` usa lifecycle antigo sob StrictMode; Testing Library fornecida emite depreciação de `ReactDOMTestUtils.act`; React Router informa futuras mudanças. Não são falhas dos testes. Não houve migração dessas bibliotecas fora do escopo.

## Executar localmente

O servidor desta entrega já está rodando na porta 3000. Para reiniciar em outra sessão:

```sh
cd /Users/felipemedici/Documents/ChatGPT/JOB/test_assessment_v1
npm ci --ignore-scripts
HOST=127.0.0.1 PORT=3000 BROWSER=none npm start
```

Não inicie outra instância enquanto a porta estiver ocupada. A aplicação requer internet para as APIs públicas.

```sh
npm run test:safety
CI=true npm test -- --watchAll=false --runInBand
npm run build
git diff --check
```

O lint usa o ESLint já instalado com `--no-eslintrc --config node_modules/eslint-config-react-app/index.js` sobre os arquivos de produção listados na tabela. A aplicação é JavaScript/JSX, sem typecheck TypeScript separado. Nenhuma migration ou seed é necessária. `start:server` preserva o backend legado separado, mas ele não participa do fluxo validado.

## Limites e pontos não verificados

- APIs públicas podem falhar ou devolver dados antigos. A data mais recente é explícita e os estados de erro permitem tentar novamente.
- Transações representam a atividade recente retornada pelo serviço, não todo o histórico. Não foi adicionada paginação fora do requisito.
- Falhas e concorrência foram testadas de forma determinística com respostas simuladas; o fluxo normal também foi exercitado com APIs reais.
- Backend legado de autenticação/perfil/banco não foi validado funcionalmente porque não é necessário para este requisito.
- Não foi realizado audit completo de dependências legadas, teste de carga, migração de CRA ou auditoria formal de acessibilidade. Validação comprova os cenários descritos, não ausência absoluta de defeitos ou indisponibilidade de terceiros.

## Estado das tarefas e continuidade

Implementação e validação concluídas. Nenhuma tarefa funcional pendente. O vídeo será gravado pelo usuário, conforme sua decisão. Não há etapa de push/PR/deploy nesta entrega. Consulte `docs/plans/task.md` para dependências, responsáveis, arquivos e verificações.

- Base original: `2f64cfc3db86ece4ce4693cfbe12929ae2a661c6`.
- Branch integrada: `agent/token-selection`; commit final com assunto `feat: complete scoped token selection assessment`.
- Base segura: `edba88d`; dados integrados: `4086d66`; gráfico integrado: `da5cd4e`.
- Dados: branch `agent/token-data`, worktree `/Users/felipemedici/.codex/worktrees/assessment-token-data`, commit `c17650f491759c1d39b5e3124f8f4b9b96ef84b1`.
- Gráfico: branch `agent/token-chart`, worktree `/Users/felipemedici/.codex/worktrees/assessment-token-chart`, commit `4e82d7cfeef40b955989873b7bfedbf26214ff7d`.
- Worktrees preservadas; apenas a branch integrada reúne o resultado completo.
- Para retomar: leia este documento e o tracker, confirme branch/status, reutilize o servidor local e altere somente o próximo escopo autorizado. Execute testes relevantes e build depois de mudanças.
- Não restaurar hooks remotos, executar referências inertes, fazer push contra o README, publicar, fazer merge, gravar ou limpar worktrees sem nova instrução explícita.
