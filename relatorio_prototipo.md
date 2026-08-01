# 3º Trabalho de Introdução ao Desenvolvimento de Jogos
## Relatório do Protótipo Funcional - Music Guessr

**Jogo:** Music Guessr
**Disciplina:** Introdução ao Desenvolvimento de Jogos
**Grupo:** João Pedro Araújo, Túlio Mota Lima, Rafael Luiz, Otávio
**Entrega:** Protótipo funcional + relatório de desenvolvimento

---

## 1. Visão geral do protótipo

O protótipo é um jogo musical web em que o jogador ouve trechos curtos de músicas e digita a resposta para pontuar. O sistema usa autenticação, ranking, painel administrativo e um fluxo de jogo baseado em rodada, tentativa e pontuação.

O projeto foi implementado como aplicação web, com frontend em React + Vite e backend em Node.js + Express + Prisma, usando PostgreSQL para persistência.

---

## 2. Objetivo do desenvolvimento

Construir um protótipo funcional que entregue:
- interação lúdica significativa;
- core loop fluido;
- feedback visual e sonoro imediato;
- estabilidade técnica;
- ranking e persistência de desempenho;
- área administrativa para criar e organizar desafios.

---

## 3. Tecnologias utilizadas

### Frontend
- React + Vite
- React Router
- Motion / Framer Motion
- Tailwind CSS
- Axios

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- OAuth Google
- Integração com Deezer para busca e preview de músicas

---

## 4. Arquitetura do protótipo

### 4.1 Frontend
O frontend concentra as telas de login, registro, home, seleção de desafio, partida, ranking, perfil e área administrativa. A interface usa componentes reutilizáveis, animações de feedback e tema claro/escuro.

### 4.2 Backend
O backend organiza autenticação, desafios, sessão de jogo, ranking, perfil e estatísticas. O jogo usa sessões em memória para controlar rodada atual, score e feedback durante a partida.

### 4.3 Banco de dados
O modelo de dados inclui:
- `Usuario`
- `Desafio`
- `DesafioMusica`
- `Tentativa`

Esses modelos sustentam usuários, desafios, músicas vinculadas e histórico de pontuação.

---

## 5. Como o jogo funciona

1. O jogador entra no sistema e faz login ou cadastro.
2. Escolhe um desafio musical disponível.
3. O sistema carrega o preview da música da rodada.
4. O jogador digita o palpite.
5. O backend valida a resposta com regras que toleram pequenas variações.
6. Se acertar, recebe pontuação base + bônus por velocidade.
7. O jogo avança para a próxima rodada.
8. Ao final, as tentativas são persistidas e o ranking é atualizado.

---

## 6. Critérios do professor e atendimento no protótipo

### 6.1 Interação lúdica significativa e arquitetura de código
Atendido. Cada ação do jogador gera retorno claro e imediato:
- envio de palpite;
- feedback de acerto ou erro;
- atualização da pontuação;
- avanço de rodada;
- finalização da sessão com resumo.

A arquitetura está separada em rotas, controllers, hooks e componentes reutilizáveis.

### 6.2 Calibração do flow e core loop
Atendido. O ciclo principal está implementado e operacional:
- ouvir trecho;
- responder;
- receber feedback;
- continuar ou encerrar a sessão.

A dificuldade altera a janela do trecho, o ritmo da partida e a pontuação, ajudando a manter o jogador engajado.

### 6.3 Integração estética e sonoplastia
Atendido. O protótipo possui:
- identidade visual consistente;
- animações de feedback;
- sinais sonoros de acerto, erro e conclusão;
- interface que reforça a leitura do estado do jogo.

### 6.4 Storytelling e UX
Atendido. A experiência é construída em torno da temática musical e da progressão por desafios. A interface permite leitura rápida do estado da partida e acesso direto às funções principais, sem excesso de fricção.

### 6.5 Estabilidade técnica, versionamento e QA
Atendido em nível de protótipo web. O projeto possui:
- build de frontend;
- backend funcional;
- autenticação;
- tratamento de erros em fluxos principais;
- repositório Git com histórico de desenvolvimento.

---

## 7. Decisões tomadas durante o desenvolvimento

- Separação entre frontend e backend para organização do código.
- Uso de Prisma + PostgreSQL para persistência relacional.
- Sessão de jogo em memória para simplificar o protótipo.
- Validação inteligente de respostas para reduzir frustração do jogador.
- Pontuação com bônus de tempo para reforçar o ritmo do jogo.
- Persistência apenas ao final da partida para manter o ranking coerente.
- Painel admin para criar e organizar desafios.

---

## 8. Participação dos membros

### João Pedro Araújo
- backend
- autenticação
- sessão de jogo
- ranking

### Rafael Luiz
- modelagem de dados
- Prisma
- persistência
- integração de estatísticas

### Túlio Mota Lima
- frontend
- interface
- fluxo visual
- feedback de interação

### Otávio
- telas e navegação
- ajustes de usabilidade
- refinamento visual

---

## 9. Entregáveis

- Relatório do desenvolvimento do protótipo.
- Link do GitHub.
- Código-fonte completo.
- Protótipo funcional em execução web.

---

## 10. Conclusão

O protótipo entregue demonstra o core loop do jogo, a integração entre interface e backend, a persistência do desempenho e a possibilidade de evolução para novas funcionalidades. O projeto atende ao objetivo de apresentar um jogo funcional, jogável e coerente com os critérios do trabalho.

---

## Observação para submissão

Este relatório foi escrito para ser convertido em PDF. Se preferir, use a versão em LaTeX em `relatorio_prototipo.tex`.
