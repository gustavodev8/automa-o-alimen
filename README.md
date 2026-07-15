# Lanchonete Central

Sistema de automação para lanchonete via WhatsApp com Evolution API, OpenAI, Prisma, Redis e painel web em Next.js.

## Stack

- Backend: Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Redis, BullMQ, JWT, Zod, Pino
- Frontend: Next.js, React, TailwindCSS, TanStack Query
- Integração: Evolution API e OpenAI API

## Estrutura

- `apps/api`: API Fastify com arquitetura limpa
- `apps/web`: painel web administrativo e operacional
- `docker-compose.yml`: banco, Redis, API, web e Nginx

## Como rodar

1. Instale as dependências

```bash
npm install
```

2. Configure o ambiente

```bash
Copy-Item .env.example .env
```

3. Gere o Prisma Client

```bash
npm run db:generate
```

4. Rode as migrations e o seed

```bash
npm run db:migrate
npm run db:seed
```

5. Suba os apps em desenvolvimento

```bash
npm run dev
```

## Modo de teste local

Para testar sem VPS, suba a Evolution local junto com o banco dela:

```bash
npm run evolution:up
```

Depois:

1. Suba o banco do app com `docker compose up -d postgres redis`.
2. Rode `npm run db:migrate` e `npm run db:seed`.
3. Inicie a API e o painel com `npm run dev`.
4. Abra a Evolution em `http://localhost:8081`.
5. Crie ou conecte a instancia `lanchonete`.
6. Escaneie o QR code com o WhatsApp do numero que vai testar.

A webhook global ja vem apontada para a API local em `http://host.docker.internal:3001/api/v1/webhooks/evolution/webhook`, entao nao precisa de VPS nem de tunel publico nessa fase. A Evolution local sobe em `http://localhost:8081`.

## Respostas automaticas com IA

Quando uma mensagem de texto chega pelo WhatsApp, a API salva a conversa, consulta a IA configurada e envia a resposta de volta pela Evolution.

Para usar a IA do GitHub Models, deixe assim no `.env` e em `apps/api/.env`:

```env
AI_PROVIDER=github
AI_API_KEY=cole_sua_chave_aqui
AI_MODEL=azure-openai/gpt-4-1-mini
AI_AUTO_REPLY_ENABLED=true
```

Para usar Gemini:

```env
AI_PROVIDER=gemini
AI_API_KEY=cole_sua_chave_aqui
AI_MODEL=gemini-1.5-flash
AI_AUTO_REPLY_ENABLED=true
```

Para usar OpenAI direto:

```env
AI_PROVIDER=openai
AI_API_KEY=cole_sua_chave_aqui
AI_MODEL=gpt-4o-mini
AI_AUTO_REPLY_ENABLED=true
```

Depois de trocar a chave ou o provedor, reinicie a API com `npm run dev`. Se `AI_API_KEY` estiver vazia, as mensagens recebidas continuam sendo salvas no banco, mas o bot nao responde automaticamente.

## Acesso inicial

- Painel web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

## Credenciais de seed

- Email: `admin@lanchonete.local`
- Senha: `Admin@12345`

## Onde conectar o numero

Se a instancia ainda nao existir, crie uma vez com `POST http://localhost:8081/instance/create` e este corpo:

```json
{
  "instanceName": "lanchonete",
  "qrcode": true,
  "integration": "WHATSAPP-BAILEYS"
}
```

Depois disso, abra `GET http://localhost:8081/instance/connect/lanchonete` com a header `apikey: change-me`. A resposta traz o QR code em `base64`. Depois de conectar, as mensagens chegam no webhook da API automaticamente.

## Banco

O schema inicial inclui clientes, produtos, categorias, pedidos, itens do pedido, pagamentos, entregadores, usuários, configurações, histórico de status, mensagens, conversas, cupons e taxas de entrega.

## Arquitetura

O backend foi organizado em camadas:

- `shared`: config, erros e tipos comuns
- `infrastructure`: Prisma, logger e integrações
- `interfaces`: HTTP, rotas e middlewares
- `modules`: auth, catálogo, pedidos, dashboard, conversas, Evolution, IA e pagamentos
- `application`: portas e contratos da aplicação

## MVP já entregue

- Login administrativo
- Cadastro de categorias
- Cadastro de produtos
- Cadastro de clientes
- API de pedidos
- Painel de cozinha
- Dashboard resumido
- Webhook inicial da Evolution
- Resposta automatica por IA via GitHub Models, Gemini ou OpenAI
- Estrutura pronta para gateways de pagamento
