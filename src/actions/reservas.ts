'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/server-cache'

export interface CriarReservaData {
  sessaoId: string;
  assentos: string[];
  nomeCliente: string;
  emailCliente: string;
}

export async function criarReserva(data: CriarReservaData) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id: data.sessaoId },
      include: {
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    const assentosOcupados = sessao.reservas.reduce((ocupados, reserva) => {
      const assentos = JSON.parse(reserva.assentos)
      return [...ocupados, ...assentos]
    }, [] as string[])

    const conflito = data.assentos.some(assento => assentosOcupados.includes(assento))
    if (conflito) {
      return { success: false, error: 'Um ou mais assentos já estão ocupados' }
    }

    const reserva = await prisma.reserva.create({
      data: {
        sessaoId: data.sessaoId,
        assentos: JSON.stringify(data.assentos),
        quantidade: data.assentos.length,
        tipo: 'reserva',
        nomeCliente: data.nomeCliente,
        emailCliente: data.emailCliente,
      },
      include: {
        sessao: {
          include: {
            filme: true,
          },
        },
      },
    })

    revalidatePath('/admin/reservas')
    revalidatePath(`/admin/sessoes/${data.sessaoId}`)
    revalidatePath(`/sessao/${data.sessaoId}`)
    revalidateTag(CACHE_TAGS.reservations)
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: reserva }
  } catch (error) {
    console.error('Erro ao criar reserva:', error)
    return { success: false, error: 'Erro ao criar reserva' }
  }
}

export async function cancelarReserva(reservaId: string) {
  try {
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id: reservaId },
    })

    if (!reservaExistente) {
      return { success: false, error: 'Reserva não encontrada' }
    }

    if (reservaExistente.tipo === 'cancelamento') {
      return { success: false, error: 'Reserva já foi cancelada' }
    }

    const reservaCancelada = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        tipo: 'cancelamento',
        updatedAt: new Date(),
      },
      include: {
        sessao: {
          include: {
            filme: true,
          },
        },
      },
    })

    revalidatePath('/admin/reservas')
    revalidatePath(`/admin/sessoes/${reservaExistente.sessaoId}`)
    revalidatePath(`/sessao/${reservaExistente.sessaoId}`)
    revalidateTag(CACHE_TAGS.reservations)
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: reservaCancelada }
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error)
    return { success: false, error: 'Erro ao cancelar reserva' }
  }
}

export async function listarReservas() {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        sessao: {
          include: {
            filme: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: reservas }
  } catch (error) {
    console.error('Erro ao listar reservas:', error)
    return { success: false, error: 'Erro ao buscar reservas' }
  }
}

export async function buscarReservasPorSessao(sessaoId: string) {
  try {
    const reservas = await prisma.reserva.findMany({
      where: { sessaoId },
      include: {
        sessao: {
          include: {
            filme: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: reservas }
  } catch (error) {
    console.error('Erro ao buscar reservas por sessão:', error)
    return { success: false, error: 'Erro ao buscar reservas' }
  }
}

export async function obterAssentosOcupados(sessaoId: string) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id: sessaoId },
      include: {
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    const assentosOcupados = sessao.reservas.reduce((ocupados, reserva) => {
      const assentos = JSON.parse(reserva.assentos)
      return [...ocupados, ...assentos]
    }, [] as string[])

    return { success: true, data: assentosOcupados }
  } catch (error) {
    console.error('Erro ao obter assentos ocupados:', error)
    return { success: false, error: 'Erro ao obter assentos ocupados' }
  }
}

export async function verificarDisponibilidadeAssentos(sessaoId: string) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id: sessaoId },
      include: {
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    const assentosOcupados = sessao.reservas.reduce((ocupados, reserva) => {
      const assentos = JSON.parse(reserva.assentos)
      return [...ocupados, ...assentos]
    }, [] as string[])

    const todosAssentos = []
    for (let linha = 1; linha <= sessao.linhas; linha++) {
      for (let coluna = 1; coluna <= sessao.colunas; coluna++) {
        const letraLinha = String.fromCharCode(64 + linha) // A, B, C...
        const assentoId = `${letraLinha}${coluna}`
        todosAssentos.push({
          id: assentoId,
          ocupado: assentosOcupados.includes(assentoId),
        })
      }
    }

    return { success: true, data: todosAssentos }
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return { success: false, error: 'Erro ao verificar disponibilidade' }
  }
}

export async function buscarReservasPorEmail(email: string) {
  try {
    const reservas = await prisma.reserva.findMany({
      where: {
        emailCliente: email,
        tipo: 'reserva',
      },
      include: {
        sessao: {
          include: {
            filme: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: reservas }
  } catch (error) {
    console.error('Erro ao buscar reservas por email:', error)
    return { success: false, error: 'Erro ao buscar reservas' }
  }
}

export async function calcularReceitaSessao(sessaoId: string) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id: sessaoId },
      include: {
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    const totalIngressos = sessao.reservas.reduce((total, reserva) => {
      return total + reserva.quantidade
    }, 0)

    const receita = totalIngressos * sessao.preco

    return {
      success: true,
      data: {
        totalIngressos,
        precoUnitario: sessao.preco,
        receita,
      },
    }
  } catch (error) {
    console.error('Erro ao calcular receita:', error)
    return { success: false, error: 'Erro ao calcular receita' }
  }
} 