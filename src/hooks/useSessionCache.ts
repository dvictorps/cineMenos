'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarSessoes } from '@/actions'

const CACHE_KEYS = {
  sessions: 'sessions',
  activeSessions: 'active-sessions',
  sessionDetails: (id: string) => ['session', id],
} as const

// Hook para listar sessões (cache médio - reservas podem mudar)
export function useActiveSessions() {
  return useQuery({
    queryKey: [CACHE_KEYS.activeSessions],
    queryFn: async () => {
      const result = await listarSessoes()
      if (result.success && result.data) {
        return result.data.filter(sessao => sessao.ativo)
      }
      throw new Error(result.error || 'Erro ao carregar sessões ativas')
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  })
}

// Hook para detalhes de sessão (cache curto - ocupação muda)
export function useSessionDetails(id: string) {
  return useQuery({
    queryKey: CACHE_KEYS.sessionDetails(id),
    queryFn: async () => {
      const result = await listarSessoes()
      if (result.success && result.data) {
        const session = result.data.find(sessao => sessao.id === id)
        if (!session) throw new Error('Sessão não encontrada')
        return session
      }
      throw new Error(result.error || 'Erro ao carregar sessão')
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id,
  })
}

// Hook para invalidar cache de sessões
export function useInvalidateSessions() {
  const queryClient = useQueryClient()
  
  return {
    invalidateSessions: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.sessions] })
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.activeSessions] })
    },
    invalidateSessionDetails: (id: string) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.sessionDetails(id) })
    },
  }
}

export function useSessionCache() {
  return useQuery({
    queryKey: [CACHE_KEYS.sessions],
    queryFn: async () => {
      const result = await listarSessoes()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.error || 'Erro ao carregar sessões')
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  })
} 