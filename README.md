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
copy .env.example .env
```

3. Gere o Prisma Client

```bash
npm run prisma:generate -w apps/api
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

## Acesso inicial

- Painel web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

## Credenciais de seed

- Email: `admin@lanchonete.local`
- Senha: `Admin@12345`

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
- Service de IA preparado para OpenAI
- Estrutura pronta para gateways de pagamento
