-- Bootstrap SQL for a fresh PostgreSQL database.
-- This file creates the Prisma schema used by the API and adds the local test seed.

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ATENDENTE', 'COZINHA', 'ENTREGADOR');

-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('INICIO', 'ESCOLHENDO_CATEGORIA', 'ESCOLHENDO_PRODUTO', 'ESCOLHENDO_QUANTIDADE', 'ESCOLHENDO_ADICIONAIS', 'RESUMO', 'AGUARDANDO_ENDERECO', 'AGUARDANDO_LOCALIZACAO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'SAIU_ENTREGA', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NOVO', 'PAGO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ENTREGA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'AUDIO', 'IMAGE', 'DOCUMENT', 'LOCATION', 'STATUS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentGatewayType" AS ENUM ('MERCADO_PAGO', 'ASAAS', 'EFI', 'PAGSEGURO', 'MANUAL');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTUAL', 'FIXO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "documento" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "apelido" TEXT,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "referencia" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoriaId" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "foto" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "tempoPreparo" INTEGER NOT NULL DEFAULT 0,
    "ordemExibicao" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "enderecoId" TEXT,
    "conversaId" TEXT,
    "cupomId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'NOVO',
    "tipo" "OrderType" NOT NULL DEFAULT 'ENTREGA',
    "origem" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "observacoes" TEXT,
    "tempoEstimadoMinutos" INTEGER,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "gateway" "PaymentGatewayType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregadores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "veiculo" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "tipo" "MessageType" NOT NULL DEFAULT 'TEXT',
    "direcao" "MessageDirection" NOT NULL DEFAULT 'INBOUND',
    "conteudo" TEXT,
    "mediaUrl" TEXT,
    "rawPayload" JSONB,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estado" "ConversationState" NOT NULL DEFAULT 'INICIO',
    "ultimaPergunta" TEXT,
    "contexto" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupoms" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipoDesconto" "DiscountType" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "valorMinimo" DECIMAL(10,2),
    "limiteUso" INTEGER,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "validadeInicio" TIMESTAMP(3),
    "validadeFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxas_entrega" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bairro" TEXT,
    "cepInicial" TEXT,
    "cepFinal" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "tempoEstimadoMinutos" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxas_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "enderecos_clienteId_idx" ON "enderecos"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "categorias_ativo_idx" ON "categorias"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_nome_key" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");

-- CreateIndex
CREATE INDEX "produtos_ativo_idx" ON "produtos"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigo_key" ON "pedidos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_conversaId_key" ON "pedidos"("conversaId");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "pedidos_createdAt_idx" ON "pedidos"("createdAt");

-- CreateIndex
CREATE INDEX "pedido_itens_pedidoId_idx" ON "pedido_itens"("pedidoId");

-- CreateIndex
CREATE INDEX "pedido_itens_produtoId_idx" ON "pedido_itens"("produtoId");

-- CreateIndex
CREATE INDEX "pagamentos_pedidoId_idx" ON "pagamentos"("pedidoId");

-- CreateIndex
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");

-- CreateIndex
CREATE UNIQUE INDEX "entregadores_telefone_key" ON "entregadores"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "entregadores_usuarioId_key" ON "entregadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- CreateIndex
CREATE INDEX "historico_status_pedidoId_idx" ON "historico_status"("pedidoId");

-- CreateIndex
CREATE INDEX "historico_status_status_idx" ON "historico_status"("status");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_idx" ON "mensagens"("conversaId");

-- CreateIndex
CREATE INDEX "mensagens_clienteId_idx" ON "mensagens"("clienteId");

-- CreateIndex
CREATE INDEX "conversas_clienteId_idx" ON "conversas"("clienteId");

-- CreateIndex
CREATE INDEX "conversas_estado_idx" ON "conversas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "cupoms_codigo_key" ON "cupoms"("codigo");

-- CreateIndex
CREATE INDEX "cupoms_ativo_idx" ON "cupoms"("ativo");

-- CreateIndex
CREATE INDEX "taxas_entrega_ativo_idx" ON "taxas_entrega"("ativo");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "cupoms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status" ADD CONSTRAINT "historico_status_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

BEGIN;

INSERT INTO "usuarios" ("id", "nome", "email", "senhaHash", "role", "ativo", "updatedAt")
VALUES (
  'usr_admin_local',
  'Administrador',
  'admin@lanchonete.local',
  '$2b$12$6MZgZFjb0vjtrsAKNV7qR.kgPt8Q3hzCL5phXUin4345H5L5yZTRS',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "categorias" ("id", "nome", "descricao", "ativo", "updatedAt")
VALUES
  ('cat_burgers_local', 'Burgers', 'Hamburgueres artesanais e smashs', true, CURRENT_TIMESTAMP),
  ('cat_bebidas_local', 'Bebidas', 'Refrigerantes, sucos e aguas', true, CURRENT_TIMESTAMP),
  ('cat_adicionais_local', 'Adicionais', 'Extras, molhos e acompanhamentos', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nome") DO NOTHING;

INSERT INTO "produtos" (
  "id", "nome", "descricao", "categoriaId", "preco", "foto", "ativo", "estoque", "tempoPreparo", "ordemExibicao", "updatedAt"
)
VALUES
  (
    'prd_x_burger_local',
    'X-Burger',
    'Hamburguer com queijo, alface e tomate',
    'cat_burgers_local',
    24.90,
    NULL,
    true,
    50,
    12,
    0,
    CURRENT_TIMESTAMP
  ),
  (
    'prd_coca_350ml_local',
    'Coca-Cola 350ml',
    'Lata gelada',
    'cat_bebidas_local',
    8.00,
    NULL,
    true,
    80,
    1,
    0,
    CURRENT_TIMESTAMP
  ),
  (
    'prd_batata_frita_local',
    'Batata Frita',
    'Porcao individual crocante',
    'cat_adicionais_local',
    14.00,
    NULL,
    true,
    40,
    10,
    0,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("nome") DO NOTHING;

INSERT INTO "configuracoes" ("id", "chave", "valor", "descricao", "updatedAt")
VALUES (
  'cfg_store_name_local',
  'store_name',
  '"Lanchonete Central"',
  'Nome exibido no painel',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("chave") DO NOTHING;

INSERT INTO "taxas_entrega" ("id", "nome", "bairro", "cepInicial", "cepFinal", "valor", "tempoEstimadoMinutos", "ativo", "updatedAt")
VALUES (
  'fee_padrao_local',
  'Entrega padrao',
  NULL,
  NULL,
  NULL,
  6.00,
  25,
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

COMMIT;
