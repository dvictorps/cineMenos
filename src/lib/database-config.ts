export const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  
  // Durante build, retornar URL padrão se não estiver definida
  if (!url) {
    return 'postgresql://localhost:5432/temp'
  }

  // Para Supabase em produção, otimizar conexão
  if (process.env.NODE_ENV === 'production' && url.includes('supabase.co')) {
    try {
      // Adicionar parâmetros de conexão otimizados para serverless
      const urlObj = new URL(url)
      urlObj.searchParams.set('pgbouncer', 'true')
      urlObj.searchParams.set('connection_limit', '1')
      urlObj.searchParams.set('pool_timeout', '10')
      urlObj.searchParams.set('connect_timeout', '10')
      
      return urlObj.toString()
    } catch {
      // Se falhar ao processar URL, retornar original
      return url
    }
  }
  
  return url
}

export const connectionConfig = {
  // Configurações específicas para Vercel
  maxConnections: process.env.NODE_ENV === 'production' ? 1 : 5,
  connectionTimeout: 10000,
  queryTimeout: 10000,
  statementTimeout: 10000,
} 