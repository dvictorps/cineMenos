'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/server-cache'
import type { CreateSessaoData } from '@/lib/types'
import { startOfDay, endOfDay, addDays } from 'date-fns'

export async function criarSessao(data: CreateSessaoData) {
  try {
    const sessao = await prisma.sessao.create({
      data: {
        filmeId: data.filmeId,
        dataHora: data.dataHora,
        sala: data.sala,
        linhas: data.linhas || 5,
        colunas: data.colunas || 10,
        preco: data.preco,
      },
      include: {
        filme: true,
      },
    })

    revalidatePath('/admin/sessoes')
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    return { success: false, error: 'Erro ao criar sessão' }
  }
}

export async function listarSessoes() {
  try {
    const sessoes = await prisma.sessao.findMany({
      include: {
        filme: true,
        reservas: true,
      },
      orderBy: { dataHora: 'asc' },
    })

    return { success: true, data: sessoes }
  } catch (error) {
    console.error('Erro ao listar sessões:', error)
    return { success: false, error: 'Erro ao buscar sessões' }
  }
}

export async function buscarSessaoPorId(id: string) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return { success: false, error: 'Erro ao buscar sessão' }
  }
}

export async function buscarSessaoAtivaPublica(id: string) {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { 
        id,
        ativo: true,
        filme: {
          ativo: true,
        },
      },
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
    })

    if (!sessao) {
      return { success: false, error: 'Sessão não encontrada ou não está disponível' }
    }

    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao buscar sessão ativa:', error)
    return { success: false, error: 'Erro ao buscar sessão' }
  }
}

export async function atualizarSessao(id: string, data: CreateSessaoData) {
  try {
    const sessao = await prisma.sessao.update({
      where: { id },
      data: {
        filmeId: data.filmeId,
        dataHora: data.dataHora,
        sala: data.sala,
        linhas: data.linhas || 5,
        colunas: data.colunas || 10,
        preco: data.preco,
      },
      include: {
        filme: true,
      },
    })

    revalidatePath('/admin/sessoes')
    revalidatePath(`/admin/sessoes/${id}`)
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error)
    return { success: false, error: 'Erro ao atualizar sessão' }
  }
}

export async function desativarSessao(id: string) {
  try {
    const sessao = await prisma.sessao.update({
      where: { id },
      data: { ativo: false },
      include: {
        filme: true,
      },
    })

    // Invalidar múltiplos caches relacionados
    revalidatePath('/admin/sessoes')
    revalidatePath('/')
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.dashboard)
    
    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao desativar sessão:', error)
    return { success: false, error: 'Erro ao desativar sessão' }
  }
}

export async function ativarSessao(id: string) {
  try {
    const sessao = await prisma.sessao.update({
      where: { id },
      data: { ativo: true },
      include: {
        filme: true,
      },
    })

    // Invalidar múltiplos caches relacionados
    revalidatePath('/admin/sessoes')
    revalidatePath('/')
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.dashboard)
    
    return { success: true, data: sessao }
  } catch (error) {
    console.error('Erro ao ativar sessão:', error)
    return { success: false, error: 'Erro ao ativar sessão' }
  }
}

export async function listarSessoesAtivas() {
  try {
    const sessoes = await prisma.sessao.findMany({
      where: {
        ativo: true,
        filme: {
          ativo: true,
        },
        dataHora: {
          gte: new Date(),
        },
      },
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
      orderBy: { dataHora: 'asc' },
    })

    return { success: true, data: sessoes }
  } catch (error) {
    console.error('Erro ao listar sessões ativas:', error)
    return { success: false, error: 'Erro ao buscar sessões' }
  }
}

export async function buscarSessoesPorData(data: Date) {
  try {
    const inicioDia = startOfDay(data)
    const fimDia = endOfDay(data)

    const sessoes = await prisma.sessao.findMany({
      where: {
        ativo: true,
        filme: {
          ativo: true,
        },
        dataHora: {
          gte: inicioDia,
          lte: fimDia,
        },
      },
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
      orderBy: { dataHora: 'asc' },
    })

    return { success: true, data: sessoes }
  } catch (error) {
    console.error('Erro ao buscar sessões por data:', error)
    return { success: false, error: 'Erro ao buscar sessões' }
  }
}

export async function buscarSessoesProximaSemana() {
  try {
    const hoje = new Date()
    const proximaSemana = addDays(hoje, 7)

    const sessoes = await prisma.sessao.findMany({
      where: {
        ativo: true,
        filme: {
          ativo: true,
        },
        dataHora: {
          gte: hoje,
          lte: proximaSemana,
        },
      },
      include: {
        filme: true,
        reservas: {
          where: { tipo: 'reserva' },
        },
      },
      orderBy: { dataHora: 'asc' },
    })

    return { success: true, data: sessoes }
  } catch (error) {
    console.error('Erro ao buscar sessões da próxima semana:', error)
    return { success: false, error: 'Erro ao buscar sessões' }
  }
}

export async function calcularOcupacaoSessao(sessaoId: string) {
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

    const totalAssentos = sessao.linhas * sessao.colunas
    const assentosOcupados = sessao.reservas.reduce((total, reserva) => {
      const assentos = JSON.parse(reserva.assentos)
      return total + assentos.length
    }, 0)

    const percentualOcupacao = Math.round((assentosOcupados / totalAssentos) * 100)

    return {
      success: true,
      data: {
        totalAssentos,
        assentosOcupados,
        assentosDisponiveis: totalAssentos - assentosOcupados,
        percentualOcupacao,
      },
    }
  } catch (error) {
    console.error('Erro ao calcular ocupação:', error)
    return { success: false, error: 'Erro ao calcular ocupação' }
  }
} 