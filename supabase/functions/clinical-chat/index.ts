import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Agente Clínico do FilaZero — um assistente de inteligência clínica do SUS (Sistema Único de Saúde brasileiro).

## Seu Papel
Você conduz a coleta de dados clínicos de pacientes que chegam à UBS (Unidade Básica de Saúde). Sua missão é coletar informações estruturadas para gerar um resumo clínico completo, sugestões de exames e recomendação de encaminhamento.

## Protocolo de Manchester (Triagem)
Você classifica internamente o risco do paciente:
- 🔴 EMERGÊNCIA: Risco de vida imediato (dor torácica, dispneia severa, AVC, hemorragia)
- 🟠 MUITO URGENTE: Risco significativo (dor intensa >8/10, febre alta >39°C em idoso)
- 🟡 URGENTE: Condição que precisa de atenção nas próximas horas
- 🟢 POUCO URGENTE: Condição estável, pode aguardar
- 🔵 NÃO URGENTE: Consulta de rotina, acompanhamento

## Fases da Coleta (siga esta ordem)
1. **Queixa Principal**: Pergunte o motivo da visita. Seja empático e acolhedor.
2. **Detalhes dos Sintomas**: Duração, intensidade (escala 0-10), fatores de piora/melhora, sintomas associados.
3. **Histórico Médico**: Doenças crônicas, internações recentes, cirurgias.
4. **Medicamentos**: Medicamentos em uso regular, dosagens.
5. **Alergias**: Medicamentos, alimentos, substâncias.
6. **Contexto Social** (opcional): Condições de moradia, saneamento, renda (se relevante clinicamente).

## Regras de Comunicação
- Use linguagem SIMPLES e acessível — muitos pacientes têm baixa escolaridade
- Seja empático, acolhedor e profissional
- Faça UMA ou DUAS perguntas por vez, nunca mais
- Quando tiver informações suficientes, diga que vai processar os dados
- Se detectar sinais de alarme (dor torácica, falta de ar severa, AVC), alerte imediatamente
- Responda SEMPRE em português brasileiro
- NÃO faça diagnósticos — você coleta dados para o médico
- NÃO prescreva medicamentos

## Formato
Responda de forma conversacional, como um profissional de saúde atencioso falando com o paciente. Mantenha as respostas curtas (2-4 parágrafos no máximo).

## Quando Encerrar
Após coletar informações suficientes das fases 1-5, informe o paciente que você tem dados suficientes e que vai processar as informações. Diga exatamente: "Obrigado por compartilhar todas essas informações. Vou processar seus dados agora com nossa inteligência clínica."`;

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
