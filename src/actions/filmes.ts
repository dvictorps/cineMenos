'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS, getCachedActiveMovies } from '@/lib/server-cache'
import type { CreateFilmeData } from '@/lib/types'

export async function criarFilme(data: CreateFilmeData) {
  try {
    // Validações server-side
    if (!data.titulo?.trim()) {
      return { success: false, error: 'Título é obrigatório' }
    }
    if (!data.descricao?.trim()) {
      return { success: false, error: 'Descrição é obrigatória' }
    }
    if (!data.genero?.trim()) {
      return { success: false, error: 'Gênero é obrigatório' }
    }
    if (!data.duracao || data.duracao <= 0) {
      return { success: false, error: 'Duração deve ser maior que zero' }
    }
    if (!data.classificacao?.trim()) {
      return { success: false, error: 'Classificação é obrigatória' }
    }

    const filme = await prisma.filme.create({
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao.trim(),
        duracao: data.duracao,
        genero: data.genero.trim(),
        classificacao: data.classificacao,
        banner: data.banner?.trim() || null,
      },
    })

    revalidatePath('/admin/filmes')
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao criar filme:', error)
    return { success: false, error: 'Erro ao criar filme' }
  }
}

export async function listarFilmes() {
  try {
    const filmes = await prisma.filme.findMany({
      include: {
        sessoes: {
          orderBy: { dataHora: 'asc' },
        },
      },
      orderBy: { titulo: 'asc' },
    })

    return { success: true, data: filmes }
  } catch (error) {
    console.error('Erro ao listar filmes:', error)
    return { success: false, error: 'Erro ao buscar filmes' }
  }
}

export async function buscarFilmePorId(id: string) {
  try {
    const filme = await prisma.filme.findUnique({
      where: { id },
      include: {
        sessoes: {
          orderBy: { dataHora: 'asc' },
        },
      },
    })

    if (!filme) {
      return { success: false, error: 'Filme não encontrado' }
    }

    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao buscar filme:', error)
    return { success: false, error: 'Erro ao buscar filme' }
  }
}

export async function atualizarFilme(id: string, data: CreateFilmeData) {
  try {
    // Validações server-side
    if (!data.titulo?.trim()) {
      return { success: false, error: 'Título é obrigatório' }
    }
    if (!data.descricao?.trim()) {
      return { success: false, error: 'Descrição é obrigatória' }
    }
    if (!data.genero?.trim()) {
      return { success: false, error: 'Gênero é obrigatório' }
    }
    if (!data.duracao || data.duracao <= 0) {
      return { success: false, error: 'Duração deve ser maior que zero' }
    }
    if (!data.classificacao?.trim()) {
      return { success: false, error: 'Classificação é obrigatória' }
    }

    const filme = await prisma.filme.update({
      where: { id },
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao.trim(),
        duracao: data.duracao,
        genero: data.genero.trim(),
        classificacao: data.classificacao,
        banner: data.banner?.trim() || null,
      },
    })

    revalidatePath('/admin/filmes')
    revalidatePath(`/admin/filmes/${id}`)
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.dashboard)
    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao atualizar filme:', error)
    return { success: false, error: 'Erro ao atualizar filme' }
  }
}

export async function desativarFilme(id: string) {
  try {
    const filme = await prisma.filme.update({
      where: { id },
      data: { ativo: false },
      include: {
        sessoes: true,
      },
    })

    // Invalidar múltiplos caches relacionados
    revalidatePath('/admin/filmes')
    revalidatePath('/')
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    
    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao desativar filme:', error)
    return { success: false, error: 'Erro ao desativar filme' }
  }
}

export async function ativarFilme(id: string) {
  try {
    const filme = await prisma.filme.update({
      where: { id },
      data: { ativo: true },
      include: {
        sessoes: true,
      },
    })

    // Invalidar múltiplos caches relacionados
    revalidatePath('/admin/filmes')
    revalidatePath('/')
    revalidateTag(CACHE_TAGS.movies)
    revalidateTag(CACHE_TAGS.sessions)
    revalidateTag(CACHE_TAGS.dashboard)
    
    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao ativar filme:', error)
    return { success: false, error: 'Erro ao ativar filme' }
  }
}

export async function listarFilmesAtivos() {
  try {
    const filmes = await getCachedActiveMovies()
    return { success: true, data: filmes }
  } catch (error) {
    console.error('Erro ao listar filmes ativos:', error)
    return { success: false, error: 'Erro ao buscar filmes' }
  }
}

export async function buscarFilmesPorGenero(genero: string) {
  try {
    const filmes = await prisma.filme.findMany({
      where: {
        ativo: true,
        genero: {
          contains: genero,
          mode: 'insensitive',
        },
      },
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

    return { success: true, data: filmes }
  } catch (error) {
    console.error('Erro ao buscar filmes por gênero:', error)
    return { success: false, error: 'Erro ao buscar filmes' }
  }
}

// Nova função para buscar detalhes completos (incluindo ocupação)
export async function buscarDetalhesFilme(id: string) {
  try {
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

    if (!filme) {
      return { success: false, error: 'Filme não encontrado' }
    }

    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error)
    return { success: false, error: 'Erro ao buscar filme' }
  }
} 