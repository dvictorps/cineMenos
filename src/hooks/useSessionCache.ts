'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarSessoes, buscarSessaoPorId } from '@/actions/sessoes'

// Chaves de query para sessões
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  active: () => [...sessionKeys.lists(), 'active'] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

// Hook para listar sessões (cache médio - reservas podem mudar)
export function useActiveSessions() {
  return useQuery({
    queryKey: sessionKeys.active(),
    queryFn: async () => {
      const result = await listarSessoes()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5,  // 5 minutos - reservas podem mudar
    gcTime: 1000 * 60 * 15,    // 15 minutos em cache
    refetchOnWindowFocus: true, // Atualizar quando usuário volta
  })
}

// Hook para detalhes de sessão (cache curto - ocupação muda)
export function useSessionDetails(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: async () => {
      const result = await buscarSessaoPorId(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 2,  // 2 minutos - ocupação muda rapidamente
    gcTime: 1000 * 60 * 10,
    enabled: !!id,
    refetchOnWindowFocus: true,
  })
}

// Hook para invalidar cache de sessões
export function useInvalidateSessions() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
    invalidateActive: () => queryClient.invalidateQueries({ queryKey: sessionKeys.active() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) }),
  }
} 