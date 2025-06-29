export const MESSAGES = {
  ERRORS: {
    GENERIC: 'Ocorreu um erro inesperado',
    NETWORK: 'Erro de conexão. Verifique sua internet',
    NOT_FOUND: 'Item não encontrado',
    UNAUTHORIZED: 'Acesso não autorizado',
    LOAD_DATA: 'Erro ao carregar dados',
    SAVE_DATA: 'Erro ao salvar dados',
  },
  SUCCESS: {
    CREATED: 'Criado com sucesso!',
    UPDATED: 'Atualizado com sucesso!',
    DELETED: 'Removido com sucesso!',
    SAVED: 'Salvo com sucesso!',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Email inválido',
    INVALID_DATE: 'Data inválida',
    MIN_LENGTH: 'Mínimo de {length} caracteres',
    SELECT_SEATS: 'Selecione pelo menos um assento',
    FILL_NAME: 'Digite seu nome',
    FILL_EMAIL: 'Digite um email válido',
  },
  LOADING: {
    DEFAULT: 'Carregando...',
    SAVING: 'Salvando...',
    LOADING_DATA: 'Carregando dados...',
    PROCESSING: 'Processando...',
  },
} as const

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 10,
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
} as const

export const CLASSIFICACOES = [
  { value: 'LIVRE', label: 'Livre', color: 'bg-green-600' },
  { value: '10', label: '10 anos', color: 'bg-blue-600' },
  { value: '12', label: '12 anos', color: 'bg-yellow-600' },
  { value: '14', label: '14 anos', color: 'bg-orange-600' },
  { value: '16', label: '16 anos', color: 'bg-red-600' },
  { value: '18', label: '18 anos', color: 'bg-purple-600' },
] as const

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  FILMS: '/admin/filmes',
  SESSIONS: '/admin/sessoes',
  RESERVATIONS: '/admin/reservas',
} as const 