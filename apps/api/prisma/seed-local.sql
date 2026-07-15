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
