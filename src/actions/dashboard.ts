'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, addDays } from 'date-fns'

export async function obterEstatisticasGerais() {
  try {
    const hoje = new Date()
    const inicioDia = startOfDay(hoje)
    const fimDia = endOfDay(hoje)

    const [totalFilmes, totalSessoes, sessoesHoje, reservasHoje] = await Promise.all([
      prisma.filme.count(),
      prisma.sessao.count(),
      prisma.sessao.count({
        where: {
          dataHora: {
            gte: inicioDia,
            lte: fimDia,
          },
        },
      }),
      prisma.reserva.count({
        where: {
          tipo: 'reserva',
          dataReserva: {
            gte: inicioDia,
            lte: fimDia,
          },
        },
      }),
    ])

    return {
      success: true,
      data: {
        totalFilmes,
        totalSessoes,
        sessoesHoje,
        reservasHoje,
      },
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas gerais:', error)
    return { success: false, error: 'Erro ao buscar estatísticas' }
  }
}

export async function obterSessoesMaisProcuradas(limite = 10) {
  try {
    const sessoes = await prisma.sessao.findMany({
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    const sessoesComEstatisticas = sessoes.map(sessao => {
      const totalAssentos = sessao.linhas * sessao.colunas
      const assentosOcupados = sessao.reservas.reduce((total, reserva) => {
        const assentos = JSON.parse(reserva.assentos)
        return total + assentos.length
      }, 0)
      const percentualOcupacao = Math.round((assentosOcupados / totalAssentos) * 100)
      const receita = sessao.reservas.reduce((total, reserva) => {
        return total + (reserva.quantidade * sessao.preco)
      }, 0)

      return {
        ...sessao,
        assentosOcupados,
        percentualOcupacao,
        receita,
        totalReservas: sessao.reservas.length,
      }
    })

    const sessoesOrdenadas = sessoesComEstatisticas
      .sort((a, b) => b.percentualOcupacao - a.percentualOcupacao)
      .slice(0, limite)

    return { success: true, data: sessoesOrdenadas }
  } catch (error) {
    console.error('Erro ao buscar sessões mais procuradas:', error)
    return { success: false, error: 'Erro ao buscar sessões mais procuradas' }
  }
}

export async function obterOcupacaoPorDia(dias = 7) {
  try {
    const hoje = new Date()
    const diasAnteriores = subDays(hoje, dias - 1)

    const dadosPorDia = []

    for (let i = 0; i < dias; i++) {
      const data = addDays(diasAnteriores, i)
      const inicioDia = startOfDay(data)
      const fimDia = endOfDay(data)

      const sessoes = await prisma.sessao.findMany({
        where: {
          dataHora: {
            gte: inicioDia,
            lte: fimDia,
          },
        },
        include: {
          reservas: {
            where: { tipo: 'reserva' },
          },
        },
      })

      const totalAssentos = sessoes.reduce((total, sessao) => {
        return total + (sessao.linhas * sessao.colunas)
      }, 0)

      const assentosOcupados = sessoes.reduce((total, sessao) => {
        const ocupados = sessao.reservas.reduce((ocupados, reserva) => {
          const assentos = JSON.parse(reserva.assentos)
          return ocupados + assentos.length
        }, 0)
        return total + ocupados
      }, 0)

      const percentualOcupacao = totalAssentos > 0 ? Math.round((assentosOcupados / totalAssentos) * 100) : 0

      dadosPorDia.push({
        data: data.toISOString().split('T')[0],
        totalSessoes: sessoes.length,
        totalAssentos,
        assentosOcupados,
        percentualOcupacao,
      })
    }

    return { success: true, data: dadosPorDia }
  } catch (error) {
    console.error('Erro ao calcular ocupação por dia:', error)
    return { success: false, error: 'Erro ao calcular ocupação' }
  }
}

export async function obterReceitaPorDia(dias = 7) {
  try {
    const hoje = new Date()
    const diasAnteriores = subDays(hoje, dias - 1)

    const dadosPorDia = []

    for (let i = 0; i < dias; i++) {
      const data = addDays(diasAnteriores, i)
      const inicioDia = startOfDay(data)
      const fimDia = endOfDay(data)

      const reservas = await prisma.reserva.findMany({
        where: {
          tipo: 'reserva',
          dataReserva: {
            gte: inicioDia,
            lte: fimDia,
          },
        },
        include: {
          sessao: true,
        },
      })

      const receita = reservas.reduce((total, reserva) => {
        return total + (reserva.quantidade * reserva.sessao.preco)
      }, 0)

      const totalIngressos = reservas.reduce((total, reserva) => {
        return total + reserva.quantidade
      }, 0)

      dadosPorDia.push({
        data: data.toISOString().split('T')[0],
        receita,
        totalIngressos,
        totalReservas: reservas.length,
      })
    }

    return { success: true, data: dadosPorDia }
  } catch (error) {
    console.error('Erro ao calcular receita por dia:', error)
    return { success: false, error: 'Erro ao calcular receita' }
  }
}

export async function obterFilmesMaisPopulares(limite = 5) {
  try {
    const filmes = await prisma.filme.findMany({
      include: {
        sessoes: {
          include: {
            reservas: {
              where: { tipo: 'reserva' },
            },
          },
        },
      },
    })

    const filmesComEstatisticas = filmes.map(filme => {
      const totalReservas = filme.sessoes.reduce((total, sessao) => {
        return total + sessao.reservas.length
      }, 0)

      const totalIngressos = filme.sessoes.reduce((total, sessao) => {
        return total + sessao.reservas.reduce((subtotal, reserva) => {
          return subtotal + reserva.quantidade
        }, 0)
      }, 0)

      const receita = filme.sessoes.reduce((total, sessao) => {
        return total + sessao.reservas.reduce((subtotal, reserva) => {
          return subtotal + (reserva.quantidade * sessao.preco)
        }, 0)
      }, 0)

      return {
        ...filme,
        totalReservas,
        totalIngressos,
        receita,
        totalSessoes: filme.sessoes.length,
      }
    })

    const filmesOrdenados = filmesComEstatisticas
      .sort((a, b) => b.totalIngressos - a.totalIngressos)
      .slice(0, limite)

    return { success: true, data: filmesOrdenados }
  } catch (error) {
    console.error('Erro ao buscar filmes mais populares:', error)
    return { success: false, error: 'Erro ao buscar filmes mais populares' }
  }
} 