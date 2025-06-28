# 🎬 CineMenos - Planejamento Técnico

## 🚀 Stack Tecnológico Recomendado

### **Front-end**

- **Next.js 14** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização rápida
- **shadcn/ui** para componentes prontos e acessíveis
- **Zustand** para gerenciamento de estado
- **React Hook Form + Zod** para formulários e validação
- **Recharts** para gráficos e dashboards
- **Lucide React** para ícones

### **Back-end**

- **Next.js API Routes** (para prototipagem rápida)
- **PostgreSQL** como banco de dados
- **Prisma ORM** para type-safe database access
- **NextAuth.js** para autenticação

### **IA Agent**

- **OpenAI API** ou **Anthropic Claude** para NLP
- **LangChain** para estruturar interações
- **Custom prompt engineering** para comandos específicos

### **Deploy**

- **Vercel** (front-end + API routes)
- **Neon/PlanetScale** (PostgreSQL)

## 🏗️ Arquitetura do Sistema

### **Estrutura de Diretórios**

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Formulários específicos
│   ├── charts/           # Componentes de gráficos
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # NextAuth config
│   ├── utils.ts         # Utility functions
│   └── validations.ts   # Zod schemas
├── stores/              # Zustand stores
├── types/               # TypeScript definitions
└── hooks/               # Custom React hooks
```

### **Modelagem do Banco**

```sql
-- Filmes
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- em minutos
  genre VARCHAR(100),
  rating VARCHAR(10), -- classificação indicativa
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Salas
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rows INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL,
  total_seats INTEGER GENERATED ALWAYS AS (rows * seats_per_row) STORED
);

-- Sessões
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES movies(id),
  room_id INTEGER REFERENCES rooms(id),
  date_time TIMESTAMP NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assentos (gerados dinamicamente baseado na sala)
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  row_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  is_reserved BOOLEAN DEFAULT FALSE,
  reserved_at TIMESTAMP,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  UNIQUE(session_id, row_number, seat_number)
);

-- Reservas/Movimentações
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  seats TEXT[], -- array de IDs dos assentos
  total_amount DECIMAL(10,2),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🤖 IA Agent - Comandos Suportados

### **Consultas**

- "Quantos ingressos foram vendidos para [filme] esta semana?"
- "Qual a ocupação da sessão de [filme] às [hora]?"
- "Quais são as sessões mais procuradas hoje?"
- "Quanto foi arrecadado com [filme] no último mês?"

### **Ações**

- "Reservar [X] assentos para [filme] às [hora]"
- "Cancelar reserva do assento [posição] da sessão [detalhes]"
- "Adicionar nova sessão para [filme] em [data/hora]"

### **Implementação do Agent**

```typescript
// Estrutura do sistema de comandos
interface Command {
  intent: 'query' | 'reservation' | 'cancellation' | 'management'
  entities: {
    movie?: string
    datetime?: Date
    seats?: string[]
    customer?: string
  }
  action: string
}

// Pipeline de processamento
1. Classificação de Intent (OpenAI/Claude)
2. Extração de Entidades (NER)
3. Validação de Dados
4. Execução da Ação
5. Resposta Natural
```

## 📊 Dashboard & Relatórios

### **Métricas Principais**

- Taxa de ocupação por sessão
- Receita por período/filme/sala
- Sessões mais populares
- Horários de pico
- Performance por gênero

### **Gráficos Sugeridos**

- Line chart: Vendas ao longo do tempo
- Bar chart: Top filmes por receita
- Heatmap: Ocupação por horário/dia
- Pie chart: Distribuição por gênero
- Gauge: Taxa de ocupação média

## 🎯 Funcionalidades por Prioridade

### **MVP (Semana 1-2)**

1. ✅ Setup do projeto e dependências
2. 🔄 CRUD de filmes
3. 🔄 CRUD de sessões
4. 🔄 Sistema básico de reservas
5. 🔄 Layout responsivo

### **Fase 2 (Semana 3)**

1. Dashboard com métricas básicas
2. Sistema de relatórios
3. Validações e tratamento de erros
4. Melhorias na UX

### **Fase 3 (Semana 4)**

1. IA Agent básico
2. Comandos de consulta
3. Comandos de ação
4. Deploy e otimizações

## 🔧 Configurações Iniciais

### **shadcn/ui Setup**

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add toast
```

### **Prisma Setup**

```bash
npm install prisma @prisma/client
npx prisma init
# Configurar schema.prisma
npx prisma generate
npx prisma db push
```

## 🎨 Design System

### **Cores Principais**

- Primary: Cinema red (#DC2626)
- Secondary: Dark gray (#374151)
- Accent: Gold (#F59E0B)
- Background: Dark theme (#111827)

### **Componentes Base**

- Movie Cards
- Session Cards
- Seat Grid
- Booking Modal
- Stats Cards
- Chart Containers

## 📝 Próximos Passos

1. ✅ Configurar shadcn/ui
2. 🔄 Criar componentes base
3. 🔄 Implementar stores Zustand
4. 🔄 Configurar Prisma
5. 🔄 Desenvolver CRUD operations
6. 🔄 Implementar sistema de reservas
7. 🔄 Criar dashboard
8. 🔄 Integrar IA Agent
9. 🔄 Deploy e testes finais

---

**Este planejamento garante um desenvolvimento eficiente e organizado, priorizando MVPs e incrementos funcionais.**
