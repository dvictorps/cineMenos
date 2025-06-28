'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { CreateFilmeData } from '@/lib/types'

export async function criarFilme(data: CreateFilmeData) {
  try {
    const filme = await prisma.filme.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        duracao: data.duracao,
        genero: data.genero,
        classificacao: data.classificacao,
        banner: data.banner,
      },
    })

    revalidatePath('/admin/filmes')
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
    const filme = await prisma.filme.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        duracao: data.duracao,
        genero: data.genero,
        classificacao: data.classificacao,
        banner: data.banner,
      },
    })

    revalidatePath('/admin/filmes')
    revalidatePath(`/admin/filmes/${id}`)
    return { success: true, data: filme }
  } catch (error) {
    console.error('Erro ao atualizar filme:', error)
    return { success: false, error: 'Erro ao atualizar filme' }
  }
}

export async function removerFilme(id: string) {
  try {
    await prisma.filme.delete({
      where: { id },
    })

    revalidatePath('/admin/filmes')
    return { success: true }
  } catch (error) {
    console.error('Erro ao remover filme:', error)
    return { success: false, error: 'Erro ao remover filme' }
  }
}

export async function buscarFilmesPorGenero(genero: string) {
  try {
    const filmes = await prisma.filme.findMany({
      where: {
        genero: {
          contains: genero,
          mode: 'insensitive',
        },
      },
      include: {
        sessoes: {
          where: {
            dataHora: {
              gte: new Date(),
            },
          },
          orderBy: { dataHora: 'asc' },
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