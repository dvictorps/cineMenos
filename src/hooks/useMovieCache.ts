'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarFilmes } from '@/actions'

const CACHE_KEYS = {
  movies: 'movies',
  activeMovies: 'active-movies',
  movieDetails: (id: string) => ['movie', id],
} as const

// Hook para filmes ativos (cache longo - dados mudam pouco)
export function useActiveMovies() {
  return useQuery({
    queryKey: [CACHE_KEYS.activeMovies],
    queryFn: async () => {
      const result = await listarFilmes()
      if (result.success && result.data) {
        return result.data.filter(filme => filme.ativo)
      }
      throw new Error(result.error || 'Erro ao carregar filmes ativos')
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
}

// Hook para detalhes de filme específico
export function useMovieDetails(id: string) {
  return useQuery({
    queryKey: CACHE_KEYS.movieDetails(id),
    queryFn: async () => {
      const result = await listarFilmes()
      if (result.success && result.data) {
        const movie = result.data.find(filme => filme.id === id)
        if (!movie) throw new Error('Filme não encontrado')
        return movie
      }
      throw new Error(result.error || 'Erro ao carregar filme')
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
    enabled: !!id,
  })
}

// Hook para invalidar cache de filmes
export function useInvalidateMovies() {
  const queryClient = useQueryClient()
  
  return {
    invalidateMovies: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.movies] })
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.activeMovies] })
    },
    invalidateMovieDetails: (id: string) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.movieDetails(id) })
    },
  }
}

export function useMovieCache() {
  return useQuery({
    queryKey: [CACHE_KEYS.movies],
    queryFn: async () => {
      const result = await listarFilmes()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.error || 'Erro ao carregar filmes')
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
} 