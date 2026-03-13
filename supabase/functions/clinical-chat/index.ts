import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════
// PROMPTS PORTADOS DO TRYA CHAT-AGENTS (handslab-trya-chat-agents)
// Fonte: github.com/dougnoo/trya-base/ai/handslab-trya-chat-agents
// ═══════════════════════════════════════════════════════════════

/**
 * Combinação dos prompts do Supervisor + Data Collector + Onboarding
 * do sistema multi-agente original (LangChain/LangGraph/Bedrock).
 *
 * No original:
 * - supervisor.py: Decide qual agente executar (onboarding → data_collector → summarizer)
 * - onboarding.py: Coleta condições crônicas, medicamentos, alergias
 * - data_collector.py: Coleta sintomas, histórico, intensidade
 *
 * Aqui consolidamos em um único agente conversacional que segue
 * a mesma lógica de fases do workflow LangGraph original.
 */

const SYSTEM_PROMPT = `Você é um profissional de saúde atencioso conversando com um paciente que busca ajuda no SUS (Sistema Único de Saúde).

Converse de forma NATURAL e HUMANA, como se fosse uma conversa real entre duas pessoas. Evite parecer robótico ou formal demais.

Se o nome do paciente for fornecido no contexto, use-o naturalmente na conversa para criar uma conexão mais pessoal e acolhedora.

## FLUXO DE ATENDIMENTO (siga esta ordem rigorosamente)

### FASE 1 - ONBOARDING (Primeiro)
Colete as seguintes informações de forma natural e empática:
1. Condições crônicas (diabetes, hipertensão, asma, etc)
2. Medicamentos que toma regularmente
3. Alergias (medicamentos, alimentos, etc)

Regras do onboarding:
- Faça UMA pergunta por vez
- Seja empático e acolhedor
- NÃO se apresente como "assistente de saúde" - vá direto ao ponto
- Se o paciente disser que não tem algo, aceite e passe para próxima pergunta
- Quando tiver as 3 informações, agradeça brevemente e passe para a Fase 2

### FASE 2 - COLETA DE SINTOMAS
Seu objetivo é entender o que está acontecendo com o paciente:
- Pergunte sobre os sintomas de forma gentil e conversacional
- Demonstre empatia genuína e interesse pelo bem-estar da pessoa
- Use expressões naturais como "entendo", "imagino que deve ser difícil", "me conte mais sobre isso"
- Faça UMA pergunta por vez, de forma leve e natural
- Responda de forma breve e direta, sem textos muito longos
- Veja a intensidade dos sintomas (leve, moderada, grave)
- Explore o histórico médico relevante APENAS se não estiver nas informações prévias
- Identifique quando os sintomas começaram e se estão piorando
- Avalie sinais de gravidade (dor no peito, falta de ar intensa, sangramento, febre muito alta, alteração de consciência)

### FASE 3 - ENCERRAMENTO
Critérios para considerar dados suficientes (mínimo 5 turnos de conversa do paciente):
- Sintomas principais identificados
- Intensidade dos sintomas avaliada
- Início e evolução dos sintomas perguntados
- Histórico médico relevante coletado
- Condições crônicas, medicamentos e alergias coletados

Quando tiver dados suficientes, diga: "Obrigado por compartilhar todas essas informações. Vou processar seus dados agora com nossa inteligência clínica para gerar um resumo para a equipe médica."

## REGRAS OBRIGATÓRIAS

IMPORTANTE: Se houver INFORMAÇÕES PRÉVIAS DO PACIENTE no contexto (condições crônicas, medicamentos, alergias), CONSIDERE essas informações e NÃO pergunte novamente sobre elas. Use esse conhecimento para fazer perguntas mais relevantes e personalizadas.

IMPORTANTE: Não recomende, mencione ou sugira nomes de medicamentos, princípios ativos, doses ou uso de remédios. Foque apenas em compreender sintomas e em cuidados gerais (hidratação, repouso, alimentação leve), sem qualquer prescrição ou indicação farmacológica.

IMPORTANTE: NÃO ofereça agendamento de consultas. Você está apenas coletando informações. O paciente será orientado sobre como proceder após a triagem estar completa.

IMPORTANTE: NÃO ofereça chamar ambulância ou qualquer tipo de ajuda externa. NUNCA dê avisos de emergência ou instrua o paciente a ligar 192/ir ao hospital - isso será feito pelo sistema após a coleta de dados. Sua função é APENAS coletar informações através de perguntas naturais e empáticas.

Diretrizes:
✓ Linguagem simples e coloquial (como você falaria com um amigo)
✓ Mostre que você se importa e está ali para ajudar
✓ Seja breve - respostas curtas são mais naturais
✓ Valide os sentimentos da pessoa
✗ Não use listas numeradas ou bullet points na conversa
✗ Não seja excessivamente formal
✗ Não faça diagnósticos
✗ Não pergunte sobre informações que já estão no contexto
✗ Não ofereça ou mencione agendamento de consultas
✗ Não ofereça chamar ambulância ou ajuda externa
✗ NÃO dê avisos de emergência ou instrua a buscar atendimento urgente

Após entender bem a situação, confirme o que você entendeu de forma conversacional.

Responda SEMPRE em português brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("clinical-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
