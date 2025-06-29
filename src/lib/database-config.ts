export const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  
  if (!url) {
    throw new Error('DATABASE_URL não configurada')
  }

  // Para Supabase em produção, usar connection pooling
  if (process.env.NODE_ENV === 'production' && url.includes('supabase.co')) {
    // Verificar se já está usando pgbouncer (porta 6543)
    if (!url.includes(':6543/')) {
      console.log('🔄 Sugerindo uso de pgbouncer para melhor performance')
      // Sugerir troca da porta para pgbouncer se disponível
      // url = url.replace(':5432/', ':6543/')
    }
    
    // Adicionar parâmetros de conexão otimizados para serverless
    const urlObj = new URL(url)
    urlObj.searchParams.set('pgbouncer', 'true')
    urlObj.searchParams.set('connection_limit', '1')
    urlObj.searchParams.set('pool_timeout', '10')
    urlObj.searchParams.set('connect_timeout', '10')
    
    return urlObj.toString()
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