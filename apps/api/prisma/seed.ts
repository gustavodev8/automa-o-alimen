import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@lanchonete.local' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@lanchonete.local',
      senhaHash: passwordHash,
      role: 'ADMIN',
      ativo: true,
    },
  });

  const [burgers, drinks, sides] = await Promise.all([
    prisma.categoria.upsert({
      where: { nome: 'Burgers' },
      update: {},
      create: {
        nome: 'Burgers',
        descricao: 'Hambúrgueres artesanais e smashs',
        ativo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Bebidas' },
      update: {},
      create: {
        nome: 'Bebidas',
        descricao: 'Refrigerantes, sucos e águas',
        ativo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Adicionais' },
      update: {},
      create: {
        nome: 'Adicionais',
        descricao: 'Extras, molhos e acompanhamentos',
        ativo: true,
      },
    }),
  ]);

  await prisma.produto.upsert({
    where: { nome: 'X-Burger' },
    update: {},
    create: {
      nome: 'X-Burger',
      descricao: 'Hambúrguer com queijo, alface e tomate',
      categoriaId: burgers.id,
      preco: 24.9,
      ativo: true,
      estoque: 50,
      tempoPreparo: 12,
    },
  });

  await prisma.produto.upsert({
    where: { nome: 'Coca-Cola 350ml' },
    update: {},
    create: {
      nome: 'Coca-Cola 350ml',
      descricao: 'Lata gelada',
      categoriaId: drinks.id,
      preco: 8.0,
      ativo: true,
      estoque: 80,
      tempoPreparo: 1,
    },
  });

  await prisma.produto.upsert({
    where: { nome: 'Batata Frita' },
    update: {},
    create: {
      nome: 'Batata Frita',
      descricao: 'Porção individual crocante',
      categoriaId: sides.id,
      preco: 14.0,
      ativo: true,
      estoque: 40,
      tempoPreparo: 10,
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: 'store_name' },
    update: {},
    create: {
      chave: 'store_name',
      valor: 'Lanchonete Central',
      descricao: 'Nome exibido no painel',
    },
  });

  console.log(`Seed concluído para o usuário ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
