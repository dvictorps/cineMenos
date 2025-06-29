import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { listarFilmes, listarSessoes } from '@/actions';
import { obterEstatisticasGerais, obterSessoesMaisProcuradas } from '@/actions/dashboard';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

interface AgentQuery {
  message: string;
}

interface AgentResponse {
  success: boolean;
  response: string;
  data?: {
    intent: string;
    entities: string[];
  };
}

// Função para buscar dados do cinema quando necessário
async function getCinemaData(query: string) {
  const queryLower = query.toLowerCase();
  const data: Record<string, unknown> = {};

  // Determinar quais dados buscar baseado na query
  if (queryLower.includes('filme') || queryLower.includes('catálogo') || queryLower.includes('cartaz')) {
    const filmesResult = await listarFilmes();
    if (filmesResult.success) {
      data.filmes = filmesResult.data?.filter(f => f.ativo) || [];
    }
  }

  if (queryLower.includes('sessão') || queryLower.includes('sessões') || queryLower.includes('horário') || queryLower.includes('programação')) {
    const sessoesResult = await listarSessoes();
    if (sessoesResult.success) {
      data.sessoes = sessoesResult.data?.filter(s => s.ativo) || [];
    }
  }

  if (queryLower.includes('estatística') || queryLower.includes('dashboard') || queryLower.includes('números') || queryLower.includes('dados')) {
    const statsResult = await obterEstatisticasGerais();
    if (statsResult.success) {
      data.estatisticas = statsResult.data;
    }
  }

  if (queryLower.includes('populares') || queryLower.includes('procuradas') || queryLower.includes('vendendo') || queryLower.includes('melhores')) {
    const popularesResult = await obterSessoesMaisProcuradas(5);
    if (popularesResult.success) {
      data.sessoesMaisPopulares = popularesResult.data;
    }
  }

  return data;
}

// System prompt para o assistente
const SYSTEM_PROMPT = `Você é o CineMenos AI Assistant, um assistente inteligente especializado em gestão de cinema.

PERSONALIDADE:
- Seja profissional, prestativo e amigável
- Use linguagem clara e acessível em português brasileiro
- Seja proativo em oferecer informações relevantes
- Mantenha o foco no contexto de cinema e entretenimento

CAPACIDADES:
- Consultar informações sobre filmes em cartaz
- Verificar programação de sessões
- Analisar estatísticas do cinema
- Identificar sessões mais populares
- Fornecer insights sobre desempenho

FORMATO DE RESPOSTA:
- Use formatação em markdown quando apropriado
- Organize informações de forma clara e estruturada
- Use emojis moderadamente para melhor UX
- Seja conciso mas completo nas respostas

DADOS DISPONÍVEIS:
Quando dados do cinema forem fornecidos no contexto, use-os para dar respostas precisas e atualizadas.

IMPORTANTE:
- Se não tiver dados específicos, seja honesto sobre limitações
- Sempre contextualize informações com datas/horários quando relevante
- Sugira ações úteis quando apropriado
- Responda sempre em português brasileiro`;

export async function POST(request: NextRequest) {
  try {
    const body: AgentQuery = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "Por favor, envie uma mensagem válida."
      });
    }

    // Verificar se a API key está configurada
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "🔧 **Assistente não configurado**\n\nO assistente de IA não está configurado no momento.\n\n📝 **Como configurar:**\n1. Obtenha uma chave gratuita em: https://console.groq.com/keys\n2. Adicione `GROQ_API_KEY=sua-chave` no arquivo .env\n3. Reinicie o servidor\n\n✨ **Groq é 100% gratuito e super rápido!**"
      });
    }

    // Buscar dados relevantes do cinema
    const cinemaData = await getCinemaData(body.message);
    
    // Construir contexto com dados do cinema se disponíveis
    let contextMessage = '';
    if (Object.keys(cinemaData).length > 0) {
      contextMessage = `\n\nDADOS ATUAIS DO CINEMA (use estes dados para responder):\n${JSON.stringify(cinemaData, null, 2)}`;
    }

    // Chamar Groq (modelo Llama 3.3 70B - gratuito e poderoso)
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: body.message + contextMessage
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || 
      "Desculpe, não consegui processar sua solicitação no momento.";

    return NextResponse.json<AgentResponse>({
      success: true,
      response,
      data: {
        intent: 'ai_processed',
        entities: Object.keys(cinemaData)
      }
    });
    
  } catch (error: unknown) {
    console.error('Erro na API do agente:', error);
    
    const errorObj = error as { status?: number; error?: { message?: string; code?: string } };
    
    // Tratamento de erros específicos do Groq
    if (errorObj?.status === 401) {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "🔑 **Chave inválida**\n\nSua GROQ_API_KEY parece estar inválida ou expirada.\n\n🔄 **Solução:**\n1. Verifique sua chave em: https://console.groq.com/keys\n2. Gere uma nova chave se necessário\n3. Atualize o arquivo .env"
      });
    }

    if (errorObj?.status === 429) {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "⏳ **Limite temporário atingido**\n\nMuitas requisições em pouco tempo.\n\n💡 **Aguarde alguns segundos e tente novamente.**\n\nO Groq é gratuito mas tem limite de velocidade para uso justo."
      });
    }

    return NextResponse.json<AgentResponse>({
      success: false,
      response: "❌ **Erro temporário**\n\nOcorreu um erro ao conectar com o serviço de IA.\n\n🔄 **Tente novamente em alguns momentos.**"
    });
  }
} 