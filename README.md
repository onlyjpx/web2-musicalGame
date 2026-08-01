# 3º Trabalho de Introdução ao Desenvolvimento de Jogos  
## Relatório de Desenvolvimento do Protótipo Funcional

**Jogo:** Music Guessr  
**Disciplina:** Introdução ao Desenvolvimento de Jogos  
**Data de entrega:** 31/07  

### Integrantes da guilda
- Túlio Mota Lima
- Rafael Luiz
- Otávio
- João Pedro Araújo

---

## 1. Visão geral do protótipo

O protótipo desenvolvido é um jogo musical de adivinhação, no qual o jogador escuta trechos curtos de músicas e precisa digitar o nome correto da faixa para pontuar. O sistema foi implementado com foco em feedback imediato, progressão por dificuldade e ranking competitivo.

O projeto foi dividido em duas camadas:
- **Frontend web:** interface, experiência do jogador, HUD, animações e sonoplastia.
- **Backend API:** autenticação, gerenciamento de desafios e músicas, sessão de jogo, cálculo de pontuação, perfil e ranking.

---

## 2. Objetivo de desenvolvimento

Construir um protótipo funcional e jogável que:
- execute o core loop de forma fluida;
- entregue resposta instantânea às ações do jogador;
- apresente coesão entre mecânica, interface, arte e áudio;
- mantenha estabilidade técnica para execução em ambiente web.

---

## 3. Tecnologias utilizadas

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- Motion (animações)
- Howler (efeitos sonoros)
- Axios

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (autenticação)
- OAuth Google
- Integração com API Deezer (busca/preview das músicas)

## Launcher para entrega do protótipo

Para facilitar a avaliação, o projeto inclui o arquivo `executar-prototipo.cmd` na raiz.

Como usar:
1. Configure o `backend/.env`.
2. Dê duplo clique em `executar-prototipo.cmd`.
3. O script verifica as dependências, inicia o backend em modo dev, inicia o frontend em modo dev e abre o navegador em `http://localhost:5173`.

Se preferir abrir manualmente o build gerado, use a pasta `dist/`.

---

## 4. Arquitetura implementada

### 4.1 Camada de apresentação (Frontend)
- Rotas de navegação para Home, Login, Registro, Seleção de desafios, Partida, Ranking, Perfil e Área Admin.
- Rotas protegidas por perfil de usuário (admin/usuário).
- HUD de partida com: pontuação, rodada, tempo restante, acertos, erros, replay e feedback visual.
- Fluxos de autenticação local e com Google.

### 4.2 Camada de aplicação/negócio (Backend)
- Endpoints para autenticação, desafios, músicas dos desafios, gameplay, perfil, ranking e estatísticas globais.
- Sessões de jogo em memória para controlar rodada atual, score e respostas.
- Regras de pontuação por dificuldade e bônus por tempo de resposta.
- Persistência de tentativas ao final da sessão no banco.

### 4.3 Camada de dados
- Modelos principais: `Usuario`, `Desafio`, `DesafioMusica`, `Tentativa`.
- Relacionamentos para associar usuários, desafios, músicas e histórico de partidas.

---

## 5. Fases de desenvolvimento

### Fase 1 - Estrutura base
- Definição da stack web (React + Express + Prisma).
- Configuração de rotas principais.
- Estruturação do banco e modelos centrais.

### Fase 2 - Mecânicas centrais de jogo
- Implementação da sessão de jogo por desafio.
- Reprodução de preview musical e controle por rodada.
- Validação de resposta com comparação exata, por substring, por tokens e fuzzy matching.

### Fase 3 - Interface e feedback ao jogador
- Construção do HUD de partida.
- Feedback instantâneo de acerto/erro, animação de pontuação e resumo final da sessão.
- Implementação de replay limitado por dificuldade.

### Fase 4 - Recursos sociais e gestão
- Ranking global com filtros por período e dificuldade.
- Perfil com métricas pessoais e histórico de tentativas.
- Área administrativa para criação/edição de desafios e associação de músicas.

### Fase 5 - Refinamento e QA manual
- Ajustes de UX, mensagens de erro, validações e consistência visual.
- Verificação de estabilidade e fluxo completo de jogo.

---

## 6. Decisões técnicas e justificativas

1. **Separação frontend/backend** para organização do código e escalabilidade.  
2. **Prisma + PostgreSQL** para garantir consistência relacional dos dados.  
3. **Sessão de jogo em memória (MVP)** para simplificar o protótipo e acelerar validação da mecânica.  
4. **Dificuldade parametrizada** para calibrar flow via tempo de snippet, base de pontos e bônus.  
5. **Fuzzy matching** para tolerar pequenas variações de escrita nos palpites.  
6. **Persistência de tentativas ao final** para alimentar ranking e perfil com dados coerentes.  
7. **Feedback audiovisual imediato** (SFX + overlays + animações) para reforço da ação do jogador.

---

## 7. Atendimento aos critérios de avaliação

### 7.1 Interação lúdica significativa e arquitetura de código
- Cada entrada do jogador (envio de palpite, replay, navegação) gera resposta clara:
  - feedback de acerto/erro;
  - atualização imediata de pontuação;
  - progressão de rodada;
  - retorno visual e sonoro.
- O sistema mantém coerência de estados (sessão, rodada, score, tentativas, finalização).
- A arquitetura está modularizada por rotas, controllers, hooks e componentes.

### 7.2 Calibração do Flow e Core Loop
- O core loop está operacional:  
  **ouvir preview -> responder -> receber feedback -> avançar -> finalizar sessão**
- Dificuldades com parâmetros distintos:
  - `FACIL`, `MEDIO`, `DIFICIL`, `MUITO_DIFICIL`, `EXTREMO`.
- Bônus por velocidade estimula precisão sob pressão e evita monotonia.
- Limites de replay por dificuldade ajudam a manter tensão e ritmo.

### 7.3 Integração estética e sonoplastia (atmosfera)
- Interface com identidade visual consistente (gradientes, cards, destaque de estados).
- Sonoplastia de confirmação:
  - clique;
  - acerto;
  - erro;
  - conclusão da sessão.
- Áudio atua como feedback físico imediato e reforça leitura dos eventos.

### 7.4 Storytelling e UX
- A identidade do jogo está embutida no cenário visual e na comunicação da interface.
- HUD foi desenhada para leitura rápida e intuitiva (pontuação, tempo, rodada, acertos/erros).
- Fluxo de navegação reduz fricção: acesso rápido a jogar, ranking, perfil e admin.
- O sistema evita que narrativa/tema musical seja decorativo, conectando estética e mecânica.

### 7.5 Estabilidade técnica, versionamento e QA
- Protótipo funcional em ambiente web, com build de frontend e execução de API.
- Controle de acesso por autenticação e autorização por tipo de usuário.
- Tratamento de erros em endpoints críticos e validações de entrada.
- QA realizado de forma manual por fluxos:
  - cadastro/login;
  - criação de desafio;
  - associação de músicas;
  - partida completa;
  - atualização de ranking/perfil.
- Repositório Git utilizado durante o desenvolvimento do protótipo.

---

## 8. Participação dos integrantes

### Frente principal por área
- **Frontend:** Túlio Mota Lima, Otávio  
- **Backend:** João Pedro Araújo, Rafael Luiz

### Distribuição complementar (apoio cruzado)
- **Túlio Mota Lima:** construção e refinamento de telas jogáveis, feedback visual e componentes de interface.
- **Otávio:** integração de páginas, ajustes de usabilidade, responsividade e experiência de navegação.
- **João Pedro Araújo:** estrutura de API, autenticação, regras de sessão e integração entre endpoints de jogo.
- **Rafael Luiz:** modelagem e persistência de dados com Prisma, endpoints de ranking/perfil e suporte de integração externa.

### Atividades coletivas
- definição de mecânicas do protótipo;
- revisão de fluxo de jogo;
- validação funcional em laboratório e ajustes de estabilidade.

---

## 9. Entregáveis finais

### 9.1 Relatório
- Este documento (converter para PDF para submissão no Moodle).

### 9.2 Link do Git
- Repositório: https://github.com/onlyjpx/web2-musicalGame

### 9.3 Fontes de código
- Frontend e backend incluídos no repositório.
- Scripts de execução:
  - Frontend: `npm run dev`, `npm run build`
  - Backend: `npm run dev`, `npm start`

### 9.4 Protótipo funcional (web)
- Execução local via servidor frontend + backend.
- Build web gerada via Vite para distribuição.

### 9.5 Guia prático de execução (passo a passo)

#### A) Clonar o repositório
```bash
git clone https://github.com/onlyjpx/web2-musicalGame.git
cd web2-musicalGame
```

#### B) Frontend (raiz do projeto)
```bash
npm install
npm run dev
```
- App web: `http://localhost:5173`

#### C) Backend (`/backend`)
```bash
cd backend
npm install
npx prisma generate --schema prisma/schema.prisma
npm run dev
```
- API: `http://localhost:3000`
- Health check: `GET /ping`

#### D) Variáveis de ambiente necessárias (backend)
Criar `.env` em `backend/` com:
- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `SPOTIFY_CLIENT_ID` (opcional)
- `SPOTIFY_CLIENT_SECRET` (opcional)
- `PORT` (opcional; padrão 3000)

#### E) Build de produção do frontend
```bash
npm run build
```
- Artefatos gerados em `dist/`.

### 9.6 Checklist de submissão no Moodle
- [ ] PDF final do relatório anexado.
- [ ] Link do Git anexado.
- [ ] Código-fonte completo no repositório.
- [ ] Protótipo funcional disponível (link de execução/deploy ou executável web).

---

## 10. Conclusão

O protótipo entregue atende aos objetivos do trabalho ao apresentar um ciclo lúdico completo, com arquitetura organizada, integração audiovisual coerente, sistema de progressão por dificuldade e recursos de acompanhamento (perfil/ranking).  

Como próximos passos, o projeto pode evoluir com:
- desafios criados pela comunidade;
- modos cooperativos/temporadas;
- persistência de sessão de jogo fora da memória (ex.: Redis) para maior robustez.
