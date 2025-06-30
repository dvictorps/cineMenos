'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/server-cache'
import type { CreateSessaoData } from '@/lib/types'
import { startOfDay, endOfDay, addDays } from 'date-fns'

export async function criarSessao(data: CreateSessaoData) {
  try {
    // Validações server-side
    if (!data.filmeId?.trim()) {
      return { success: false, error: 'Filme é obrigatório' }
    }
    if (!data.dataHora || isNaN(data.dataHora.getTime())) {
      return { success: false, error: 'Data e hora são obrigatórias' }
    }
    if (data.dataHora < new Date()) {
      return { success: false, error: 'Data deve ser futura' }
    }
    if (!data.sala?.trim()) {
      return { success: false, error: 'Sala é obrigatória' }
    }
    if (!data.linhas || data.linhas < 3 || data.linhas > 15) {
      return { success: false, error: 'Número de linhas deve estar entre 3 e 15' }
    }
    if (!data.colunas || data.colunas < 5 || data.colunas > 20) {
      return { success: false, error: 'Número de colunas deve estar entre 5 e 20' }
    }
    if (!data.preco || data.preco <= 0) {
      return { success: false, error: 'Preço deve ser maior que zero' }
    }

    // Verificar se o filme existe e está ativo
    const filme = await prisma.filme.findUnique({
      where: { id: data.filmeId, ativo: true }
    })
    if (!filme) {
      return { success: false, error: 'Filme não encontrado ou inativo' }
    }

    // Verificar conflito de horário na mesma sala
    const conflito = await prisma.sessao.findFirst({
      where: {
        sala: data.sala.trim(),
        ativo: true,
        dataHora: {
          gte: new Date(data.dataHora.getTime() - 4 * 60 * 60 * 1000), // 4 horas antes
          lte: new Date(data.dataHora.getTime() + 4 * 60 * 60 * 1000), // 4 horas depois
        },
      }
    })
    if (conflito) {
      return { success: false, error: 'Conflito de horário na mesma sala' }
    }

    const sessao = await prisma.sessao.create({
      data: {
        filmeId: data.filmeId.trim(),
        dataHora: data.dataHora,
        sala: data.sala.trim(),
        linhas: data.linhas,
        colunas: data.colunas,
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
    // Validações server-side
    if (!data.filmeId?.trim()) {
      return { success: false, error: 'Filme é obrigatório' }
    }
    if (!data.dataHora || isNaN(data.dataHora.getTime())) {
      return { success: false, error: 'Data e hora são obrigatórias' }
    }
    if (!data.sala?.trim()) {
      return { success: false, error: 'Sala é obrigatória' }
    }
    if (!data.linhas || data.linhas < 3 || data.linhas > 15) {
      return { success: false, error: 'Número de linhas deve estar entre 3 e 15' }
    }
    if (!data.colunas || data.colunas < 5 || data.colunas > 20) {
      return { success: false, error: 'Número de colunas deve estar entre 5 e 20' }
    }
    if (!data.preco || data.preco <= 0) {
      return { success: false, error: 'Preço deve ser maior que zero' }
    }

    // Verificar se o filme existe e está ativo
    const filme = await prisma.filme.findUnique({
      where: { id: data.filmeId, ativo: true }
    })
    if (!filme) {
      return { success: false, error: 'Filme não encontrado ou inativo' }
    }

    const sessao = await prisma.sessao.update({
      where: { id },
      data: {
        filmeId: data.filmeId.trim(),
        dataHora: data.dataHora,
        sala: data.sala.trim(),
        linhas: data.linhas,
        colunas: data.colunas,
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