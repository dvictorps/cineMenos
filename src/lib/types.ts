import type { Filme, Sessao, Reserva } from '@prisma/client'

export type FilmeWithSessoes = Filme & {
  sessoes: Sessao[]
}

export type SessaoWithFilme = Sessao & {
  filme: Filme
}

export type SessaoWithReservas = Sessao & {
  reservas: Reserva[]
  filme: Filme
}

export type ReservaWithSessao = Reserva & {
  sessao: SessaoWithFilme
}

export type CreateFilmeData = {
  titulo: string
  descricao: string
  duracao: number
  genero: string
  classificacao: string
  banner?: string
}

export type CreateSessaoData = {
  filmeId: string
  dataHora: Date
  sala: string
  linhas?: number
  colunas?: number
  preco: number
}

export type CreateReservaData = {
  sessaoId: string
  assentos: string[]
  quantidade: number
  tipo: 'reserva' | 'cancelamento'
  nomeCliente?: string
  emailCliente?: string
}

export type AssentoStatus = {
  id: string
  ocupado: boolean
} 