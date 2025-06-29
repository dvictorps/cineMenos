import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Definir tags para organizar o cache
export const CACHE_TAGS = {
  movies: 'movies',
  sessions: 'sessions', 
  reservations: 'reservations',
  dashboard: 'dashboard',
} as const

// Cache para filmes ativos (30 minutos)
export const getCachedActiveMovies = unstable_cache(
  async () => {
    const filmes = await prisma.filme.findMany({
      where: { ativo: true },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        duracao: true,
        genero: true,
        classificacao: true,
        banner: true,
        sessoes: {
          where: {
            ativo: true,
            dataHora: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            dataHora: true,
            preco: true,
            sala: true,
          },
          orderBy: { dataHora: 'asc' },
          take: 5,
        },
      },
      orderBy: { titulo: 'asc' },
    })
    return filmes
  },
  ['active-movies'],
  {
    tags: [CACHE_TAGS.movies],
    revalidate: 1800, // 30 minutos
  }
)

// Cache para sessões ativas (10 minutos)
export const getCachedActiveSessions = unstable_cache(
  async () => {
    const sessoes = await prisma.sessao.findMany({
      where: {
        ativo: true,
        dataHora: {
          gte: new Date(),
        },
      },
      include: {
        filme: {
          select: {
            id: true,
            titulo: true,
            classificacao: true,
            duracao: true,
          },
        },
        reservas: {
          select: {
            quantidade: true,
          },
        },
      },
      orderBy: { dataHora: 'asc' },
    })
    return sessoes
  },
  ['active-sessions'],
  {
    tags: [CACHE_TAGS.sessions, CACHE_TAGS.reservations],
    revalidate: 600, // 10 minutos
  }
)

// Cache para dados do dashboard (15 minutos)
export const getCachedDashboardData = unstable_cache(
  async () => {
    const [
      totalFilmes,
      totalSessoes,
      totalReservas,
      sessoesHoje,
    ] = await Promise.all([
      prisma.filme.count({ where: { ativo: true } }),
      prisma.sessao.count({ 
        where: { 
          ativo: true,
          dataHora: { gte: new Date() }
        } 
      }),
      prisma.reserva.count(),
      prisma.sessao.count({
        where: {
          ativo: true,
          dataHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ])

    return {
      totalFilmes,
      totalSessoes,
      totalReservas,
      sessoesHoje,
    }
  },
  ['dashboard-data'],
  {
    tags: [CACHE_TAGS.dashboard, CACHE_TAGS.movies, CACHE_TAGS.sessions, CACHE_TAGS.reservations],
    revalidate: 900, // 15 minutos
  }
)

// Cache para detalhes de filme (20 minutos)
export const getCachedMovieDetails = unstable_cache(
  async (id: string) => {
    const filme = await prisma.filme.findUnique({
      where: { id, ativo: true },
      include: {
        sessoes: {
          where: {
            ativo: true,
            dataHora: {
              gte: new Date(),
            },
          },
          include: {
            reservas: {
              select: {
                quantidade: true,
              },
            },
          },
          orderBy: { dataHora: 'asc' },
        },
      },
    })
    return filme
  },
  ['movie-details'],
  {
    tags: [CACHE_TAGS.movies, CACHE_TAGS.sessions],
    revalidate: 1200, // 20 minutos
  }
)

// Cache para detalhes de sessão (5 minutos - dados mais dinâmicos)
export const getCachedSessionDetails = unstable_cache(
  async (id: string) => {
    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: {
        filme: true,
        reservas: {
          orderBy: { dataReserva: 'desc' },
        },
      },
    })
    return sessao
  },
  ['session-details'],
  {
    tags: [CACHE_TAGS.sessions, CACHE_TAGS.reservations],
    revalidate: 300, // 5 minutos
  }
) 