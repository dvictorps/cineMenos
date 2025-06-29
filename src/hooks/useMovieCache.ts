'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarFilmesAtivos, buscarDetalhesFilme } from '@/actions/filmes'

// Chaves de query organizadas
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  active: () => [...movieKeys.lists(), 'active'] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
}

// Hook para filmes ativos (cache longo - dados mudam pouco)
export function useActiveMovies() {
  return useQuery({
    queryKey: movieKeys.active(),
    queryFn: async () => {
      const result = await listarFilmesAtivos()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 15, // 15 minutos - filmes não mudam frequentemente
    gcTime: 1000 * 60 * 30,    // 30 minutos em cache
    refetchOnWindowFocus: false,
  })
}

// Hook para detalhes de filme específico
export function useMovieDetails(id: string) {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: async () => {
      const result = await buscarDetalhesFilme(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 20,
    enabled: !!id,
  })
}

// Hook para invalidar cache de filmes
export function useInvalidateMovies() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: movieKeys.all }),
    invalidateActive: () => queryClient.invalidateQueries({ queryKey: movieKeys.active() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: movieKeys.detail(id) }),
  }
} 