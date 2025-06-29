# Deploy do CineMenos

## Pré-requisitos

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# AI Agent - Groq API (gratuito)
GROQ_API_KEY="your_groq_api_key_here"

# Next.js (para produção)
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="generate_a_random_32_character_string"
```

## Deploy na Vercel (Recomendado)

### 1. Preparação

1. **Instale a CLI da Vercel:**

   ```bash
   npm install -g vercel
   ```

2. **Login na Vercel:**
   ```bash
   vercel login
   ```

### 2. Configuração do Banco de Dados

**Opção A: Vercel Postgres (Recomendado)**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em "Storage" → "Create Database" → "Postgres"
3. Copie a `DATABASE_URL` fornecida

**Opção B: Banco Externo**

- Neon (gratuito): https://neon.tech
- Supabase (gratuito): https://supabase.com
- Railway: https://railway.app

### 3. Configuração da API Groq

1. Acesse [Groq Console](https://console.groq.com)
2. Crie uma conta (gratuito)
3. Gere uma API Key
4. Copie a chave para `GROQ_API_KEY`

### 4. Deploy

1. **Na raiz do projeto, execute:**

   ```bash
   vercel
   ```

2. **Configure as variáveis de ambiente na Vercel:**

   - Acesse o dashboard da Vercel
   - Vá para seu projeto → Settings → Environment Variables
   - Adicione todas as variáveis necessárias

3. **Execute as migrações do banco:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 5. Configurações Adicionais

**Adicione ao `vercel.json` (se necessário):**

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci && npx prisma generate",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Deploy Alternativo (Railway)

1. **Conecte seu repositório no Railway**
2. **Configure as variáveis de ambiente**
3. **Railway fará o deploy automaticamente**

## Pós-Deploy

1. **Verifique se o site está funcionando**
2. **Teste as funcionalidades principais:**

   - Listagem de filmes
   - Criação de sessões
   - Sistema de reservas
   - AI Agent

3. **Configure domínio personalizado (opcional)**

## Comandos Úteis

```bash
# Build local
npm run build

# Verificar tipos
npm run lint

# Executar migrações
npx prisma migrate deploy

# Visualizar banco
npx prisma studio

# Logs do deploy
vercel logs [deployment-url]
```

## Troubleshooting

### Erro de Build

- Verifique se todas as dependências estão instaladas
- Confirme se as variáveis de ambiente estão configuradas

### Erro de Conexão com Banco

- Verifique se a `DATABASE_URL` está correta
- Confirme se as migrações foram executadas

### Erro no AI Agent

- Verifique se a `GROQ_API_KEY` está configurada
- Confirme se a API key é válida

## Monitoramento

- Use o dashboard da Vercel para monitorar performance
- Configure alertas para erros
- Monitore uso da API Groq
