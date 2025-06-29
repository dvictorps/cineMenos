import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Limpar dados existentes (opcional)
  await prisma.reserva.deleteMany()
  await prisma.sessao.deleteMany()
  await prisma.filme.deleteMany()

  const filme1 = await prisma.filme.create({
    data: {
      titulo: 'Vingadores: Ultimato',
      descricao: 'Os Vingadores se reúnem para uma batalha final contra Thanos.',
      duracao: 181,
      genero: 'Ação',
      classificacao: '12',
    },
  })

  const filme2 = await prisma.filme.create({
    data: {
      titulo: 'Parasita',
      descricao: 'Uma família pobre se infiltra na vida de uma família rica.',
      duracao: 132,
      genero: 'Drama',
      classificacao: '16',
    },
  })

  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)

  await prisma.sessao.create({
    data: {
      filmeId: filme1.id,
      dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 14, 0), // hoje às 14h
      sala: 'Sala 1',
      linhas: 5,
      colunas: 10,
      preco: 25.0,
    },
  })

  await prisma.sessao.create({
    data: {
      filmeId: filme1.id,
      dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 19, 30), // hoje às 19h30
      sala: 'Sala 2',
      linhas: 8,
      colunas: 12,
      preco: 30.0,
    },
  })

  await prisma.sessao.create({
    data: {
      filmeId: filme2.id,
      dataHora: new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate(), 16, 0), // amanhã às 16h
      sala: 'Sala 1',
      linhas: 5,
      colunas: 10,
      preco: 22.0,
    },
  })

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 