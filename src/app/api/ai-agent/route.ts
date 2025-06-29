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



// Função para buscar dados resumidos do cinema quando necessário
async function getCinemaData(query: string) {
  const queryLower = query.toLowerCase();
  const data: Record<string, unknown> = {};

  // Determinar quais dados buscar baseado na query - APENAS dados essenciais
  if (queryLower.includes('filme') || queryLower.includes('catálogo') || queryLower.includes('cartaz')) {
    const filmesResult = await listarFilmes();
    if (filmesResult.success && filmesResult.data) {
      // Enviar apenas dados resumidos dos filmes (máximo 5)
      data.filmes = filmesResult.data
        .filter(f => f.ativo)
        .slice(0, 5)
        .map(f => ({
          id: f.id,
          titulo: f.titulo,
          genero: f.genero,
          duracao: f.duracao,
          classificacao: f.classificacao,
          sessoes: f.sessoes?.length || 0
        }));
    }
  }

  if (queryLower.includes('sessão') || queryLower.includes('sessões') || queryLower.includes('horário') || queryLower.includes('programação')) {
    const sessoesResult = await listarSessoes();
    if (sessoesResult.success && sessoesResult.data) {
      // Enviar apenas sessões das próximas 24h (máximo 10)
      const agora = new Date();
      const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
      
      data.sessoes = sessoesResult.data
        .filter(s => s.ativo && new Date(s.dataHora) >= agora && new Date(s.dataHora) <= amanha)
        .slice(0, 10)
        .map(s => ({
          id: s.id,
          filmeId: s.filmeId,
          filmeNome: s.filme?.titulo || 'N/A',
          dataHora: s.dataHora,
          sala: s.sala,
          preco: s.preco
        }));
    }
  }

  if (queryLower.includes('estatística') || queryLower.includes('dashboard') || queryLower.includes('números') || queryLower.includes('dados')) {
    const statsResult = await obterEstatisticasGerais();
    if (statsResult.success) {
      data.estatisticas = statsResult.data;
    }
  }

  if (queryLower.includes('populares') || queryLower.includes('procuradas') || queryLower.includes('vendendo') || queryLower.includes('melhores') || queryLower.includes('sucesso') || queryLower.includes('favorito')) {
    const popularesResult = await obterSessoesMaisProcuradas(3);
    if (popularesResult.success && popularesResult.data) {
                    // Remover qualquer informação financeira dos dados de popularidade
       data.sessoesMaisPopulares = popularesResult.data.map((sessao) => ({
         filmeNome: sessao.filme?.titulo || 'N/A',
         totalReservas: sessao.totalReservas || 0,
         dataHora: sessao.dataHora,
         sala: sessao.sala,
         genero: sessao.filme?.genero,
         classificacao: sessao.filme?.classificacao,
         // Removemos propositalmente: preco, receita, valores monetários
       }));
    }
  }

  return data;
}

// System prompt para o assistente
const SYSTEM_PROMPT = `Você é o CineMenos AI, um assistente virtual amigável especializado em cinema e entretenimento.

PERSONALIDADE:
- Seja conversacional, caloroso e genuinamente interessado em ajudar
- Fale como um amigo que entende muito de cinema
- Use uma linguagem natural e descontraída (mas profissional)
- Seja entusiasta sobre filmes e mostre conhecimento sobre cinema
- Faça perguntas de volta quando apropriado para entender melhor o que a pessoa quer

COMO RESPONDER:
- Converse naturalmente, como se fosse uma pessoa real
- Use expressões brasileiras autênticas ("Nossa!", "Que legal!", "Show!")
- Conte curiosidades interessantes sobre os filmes quando relevante
- Faça recomendações baseadas no gosto da pessoa
- Se não souber algo específico, seja honesto mas ofereça alternativas

SOBRE POPULARIDADE:
- NUNCA mencione valores em dinheiro, receita ou aspectos financeiros
- Foque apenas em: número de reservas, procura, interesse do público
- Use termos como "mais procurado", "favorito do público", "que está fazendo sucesso"
- Baseie popularidade apenas em dados de frequência e reservas

DADOS DISPONÍVEIS:
Quando receber dados do cinema, use-os para dar respostas personalizadas e atuais sobre:
- Filmes em cartaz (título, gênero, duração, classificação)
- Sessões programadas (horários, salas)
- Popularidade baseada em número de reservas (NUNCA em dinheiro)

FORMATO:
- Responda de forma fluida e natural
- Use emojis com moderação para dar personalidade
- Organize informações importantes de forma clara
- Sempre termine com algo útil ou uma pergunta amigável`;

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
    
    // Construir contexto compacto com dados do cinema se disponíveis
    let contextMessage = '';
    if (Object.keys(cinemaData).length > 0) {
      contextMessage = '\n\nDADOS DISPONÍVEIS:';
      
      if (cinemaData.filmes) {
        const filmes = cinemaData.filmes as Array<{
          titulo: string; genero: string; duracao: number; classificacao: string; sessoes: number;
        }>;
        contextMessage += `\nFILMES (${filmes.length}): ${filmes.map(f => 
          `${f.titulo} (${f.genero}, ${f.duracao}min, ${f.classificacao}, ${f.sessoes} sessões)`
        ).join('; ')}`;
      }
      
      if (cinemaData.sessoes) {
        const sessoes = cinemaData.sessoes as Array<{
          filmeNome: string; dataHora: string; sala: string; preco: number;
        }>;
        contextMessage += `\nSESSÕES HOJE/AMANHÃ (${sessoes.length}): ${sessoes.map(s => 
          `${s.filmeNome} - ${new Date(s.dataHora).toLocaleString('pt-BR')} (Sala ${s.sala}, R$${s.preco})`
        ).join('; ')}`;
      }
      
      if (cinemaData.estatisticas) {
        const stats = cinemaData.estatisticas as Record<string, unknown>;
        contextMessage += `\nESTATÍSTICAS: ${JSON.stringify(stats)}`;
      }
      
             if (cinemaData.sessoesMaisPopulares) {
         const populares = cinemaData.sessoesMaisPopulares as Array<{
           filmeNome: string; totalReservas: number; dataHora: Date; sala: string; genero?: string;
         }>;
         contextMessage += `\nFILMES MAIS PROCURADOS: ${populares.map(p => 
           `${p.filmeNome} (${p.totalReservas} reservas, ${p.genero || 'N/A'})`
         ).join('; ')}`;
       }
    }

    // Verificar tamanho da mensagem (estimativa básica)
    const totalMessage = SYSTEM_PROMPT + body.message + contextMessage;
    const estimatedTokens = Math.ceil(totalMessage.length / 4); // Aproximação: 4 chars = 1 token
    
    if (estimatedTokens > 10000) {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "📏 **Consulta muito complexa**\n\nSua pergunta requer buscar muitos dados do sistema.\n\n💡 **Tente ser mais específico:**\n- 'Que filmes de ação temos?' em vez de 'Que filmes temos?'\n- 'Próximas sessões de hoje' em vez de 'Todas as sessões'\n- 'Estatísticas de ontem' em vez de 'Todos os dados'"
      });
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
      max_tokens: 800, // Reduzido de 1500 para 800
      temperature: 0.7,
      top_p: 0.9, // Reduzido de 1 para 0.9
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

    if (errorObj?.status === 413) {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "📏 **Mensagem muito longa**\n\nSua pergunta resultou em uma consulta muito extensa.\n\n💡 **Tente:**\n- Fazer perguntas mais específicas\n- Dividir perguntas complexas em partes menores\n- Focar em informações específicas (ex: 'filmes de ação' em vez de 'todos os filmes')\n\n🔄 **Aguarde alguns segundos e tente novamente com uma pergunta mais simples.**"
      });
    }

    if (errorObj?.status === 429 || errorObj?.error?.code === 'rate_limit_exceeded') {
      return NextResponse.json<AgentResponse>({
        success: false,
        response: "⏳ **Limite temporário atingido**\n\nMuitas requisições em pouco tempo ou limite de tokens por minuto excedido.\n\n💡 **Aguarde 1-2 minutos e tente novamente.**\n\nO Groq é gratuito mas tem limite de velocidade para uso justo."
      });
    }

    return NextResponse.json<AgentResponse>({
      success: false,
      response: "❌ **Erro temporário**\n\nOcorreu um erro ao conectar com o serviço de IA.\n\n🔄 **Tente novamente em alguns momentos.**"
    });
  }
} 