import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════
// PROMPT PORTADO DO TRYA SUMMARIZER AGENT
// Fonte: github.com/dougnoo/trya-base/ai/handslab-trya-chat-agents/src/agents/summarizer.py
// ═══════════════════════════════════════════════════════════════

const SUMMARIZER_PROMPT = `Você é um assistente de IA especializado em medicina. Sua tarefa é analisar uma conversa entre um agente de triagem e um paciente e criar um resumo claro e estruturado para um médico.

Com base em todo o histórico da conversa fornecido, extraia as seguintes informações e formate-as usando o tool calling fornecido:

- **Resumo da conversa**: Um resumo conciso de toda a interação.
- **Sintomas Principais**: Uma lista dos sintomas chave que o paciente mencionou.
- **Queixa Principal**: A razão principal pela qual o paciente procurou ajuda, de forma direta.
- **Sugestão de exames** (examSuggestions): Analise sintomas + comorbidades seguindo estes cenários:

  1. **Confirmação de Diagnóstico**: Sintomas clássicos que requerem confirmação laboratorial
     Ex: Febre + tosse → Teste rápido de Influenza, Strep A

  2. **Monitoramento de Condições Crônicas**: Paciente com doença crônica apresenta sintomas de descompensação
     Ex: Diabético com sede excessiva → HbA1c, Glicemia de Jejum
     Ex: Hipertenso com dor no peito → ECG, Troponina, Perfil Lipídico

  3. **Investigação de Sintomas Inespecíficos**: Sintomas vagos mas persistentes
     Ex: Fadiga crônica + perda de peso → Hemograma completo, TSH, Vitamina D

  4. **Análise de Risco Cardiovascular**: Múltiplos fatores de risco + sintomas atípicos
     Ex: Desconforto torácico em paciente de alto risco → ECG, Troponina, Perfil Lipídico

  Sugira 1-3 exames específicos. Deixe vazio APENAS se sintomas extremamente leves SEM comorbidades.

- **Nível de Urgência** (Protocolo de Manchester - riskLevel):
  - EMERGENCY (Vermelho): Risco de vida iminente
  - VERY_URGENT (Laranja): Muito urgente com risco potencial
  - URGENT (Amarelo): Urgente mas estável
  - LESS_URGENT (Verde): Pouco urgente
  - NON_URGENT (Azul): Não urgente

- **Nível de Cuidado** (careLevel): CONSIDERE AS COMORBIDADES ao classificar:
  - EMERGENCY_SAMU: Risco de vida, paciente não consegue se mover (dor no peito intensa + falta de ar, perda de consciência, convulsões, sangramento grave, AVC, anafilaxia)
  - EMERGENCY_HOSPITAL: Emergência mas paciente consegue se mover (dor no peito moderada em hipertenso, fratura sem sangramento, envenenamento leve, trauma ocular grave, sangramento ativo, dificuldade respiratória)
  - TELEMEDICINE: Sintomas agudos mas não emergenciais (resfriado, gripe, dor de garganta, febre baixa <38.5°C, náusea, erupções cutâneas leves)
  - IN_PERSON: Necessita exame físico ou acompanhamento NÃO URGENTE (dor persistente mas estável, investigação diagnóstica eletiva, check-up, procedimentos programados)

  IMPORTANTE: Se a recomendação mencionar "pronto-socorro", "imediato", "urgente", "hospital", USE EMERGENCY_HOSPITAL ou EMERGENCY_SAMU, NÃO IN_PERSON!

- **Recomendação de Atendimento**: Baseado no careLevel, indique onde buscar ajuda.
- **Orientações Básicas**: 3-5 dicas práticas (hidratação, repouso, alimentação). NÃO mencione medicamentos.

- **Alergias**: Extraia TODAS as alergias mencionadas. Retorne como lista de strings.
- **Medicamentos em uso**: Extraia TODOS os medicamentos mencionados. Retorne como lista de strings.
- **Condições crônicas**: Extraia TODAS as condições crônicas. Retorne como lista de strings.
- **Histórico familiar**: Extraia histórico familiar relevante. Retorne como lista de strings.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build conversation transcript (same format as Trya summarizer)
    const transcript = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "Paciente" : "Agente"}: ${m.content}`
      )
      .join("\n\n");

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
            { role: "system", content: SUMMARIZER_PROMPT },
            {
              role: "user",
              content: `Histórico da Conversa:\n${transcript}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_clinical_result",
                description: "Gera o resultado clínico estruturado (resumo médico) a partir da conversa de triagem",
                parameters: {
                  type: "object",
                  properties: {
                    chiefComplaint: { type: "string", description: "Queixa principal do paciente" },
                    conversationSummary: { type: "string", description: "Resumo conciso de toda a interação" },
                    symptoms: { type: "array", items: { type: "string" }, description: "Lista dos sintomas chave" },
                    symptomDuration: { type: "string", description: "Duração dos sintomas" },
                    painScale: { type: "number", description: "Escala de dor 0-10 (se mencionado)" },
                    currentMedications: { type: "array", items: { type: "string" }, description: "Medicamentos em uso" },
                    allergies: { type: "array", items: { type: "string" }, description: "Alergias conhecidas" },
                    chronicConditions: { type: "array", items: { type: "string" }, description: "Condições crônicas" },
                    familyHistory: { type: "array", items: { type: "string" }, description: "Histórico familiar relevante" },
                    riskLevel: {
                      type: "string",
                      enum: ["EMERGENCY", "VERY_URGENT", "URGENT", "LESS_URGENT", "NON_URGENT"],
                      description: "Classificação de risco Manchester",
                    },
                    careLevel: {
                      type: "string",
                      enum: ["EMERGENCY_SAMU", "EMERGENCY_HOSPITAL", "TELEMEDICINE", "IN_PERSON"],
                      description: "Nível de cuidado recomendado",
                    },
                    priorityScore: { type: "number", description: "Score de prioridade 0-100" },
                    clinicalSummary: {
                      type: "object",
                      properties: {
                        narrative: { type: "string", description: "Resumo clínico narrativo para o médico" },
                        structuredFindings: { type: "array", items: { type: "string" }, description: "Achados estruturados" },
                        suspectedConditions: { type: "array", items: { type: "string" }, description: "Hipóteses diagnósticas" },
                        riskFactors: { type: "array", items: { type: "string" }, description: "Fatores de risco" },
                        relevantHistory: { type: "string", description: "Histórico relevante filtrado" },
                      },
                      required: ["narrative", "structuredFindings", "suspectedConditions", "riskFactors"],
                    },
                    examSuggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          examName: { type: "string" },
                          examCode: { type: "string", description: "Código SIGTAP SUS se aplicável" },
                          category: { type: "string", enum: ["LABORATORY", "IMAGING", "FUNCTIONAL", "OTHER"] },
                          priority: { type: "string", enum: ["URGENT", "ROUTINE"] },
                          justification: { type: "string" },
                        },
                        required: ["examName", "category", "priority", "justification"],
                      },
                      description: "Exames sugeridos (1-3) baseados em sintomas + comorbidades",
                    },
                    referralRecommendation: {
                      type: "object",
                      properties: {
                        decision: {
                          type: "string",
                          enum: ["RESOLVE_PRIMARY", "REFER_SPECIALIST", "REFER_EMERGENCY", "NEEDS_MORE_DATA"],
                        },
                        confidence: { type: "number" },
                        specialty: { type: "string" },
                        justification: { type: "string" },
                        requiredExamsBeforeReferral: { type: "array", items: { type: "string" } },
                        alternativeActions: { type: "array", items: { type: "string" } },
                      },
                      required: ["decision", "confidence", "justification", "requiredExamsBeforeReferral"],
                    },
                    careRecommendation: { type: "string", description: "Recomendação de onde buscar ajuda" },
                    basicCareInstructions: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 orientações básicas (hidratação, repouso, etc. SEM medicamentos)",
                    },
                  },
                  required: [
                    "chiefComplaint", "conversationSummary", "symptoms", "riskLevel",
                    "careLevel", "priorityScore", "clinicalSummary", "examSuggestions",
                    "referralRecommendation", "careRecommendation", "basicCareInstructions",
                  ],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_clinical_result" } },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    let extractedData;

    // Try tool_calls first
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Tool call parse failed:", e);
      }
    }

    // Fallback: parse JSON from content
    if (!extractedData) {
      const content = result.choices?.[0]?.message?.content || "";
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Content JSON parse failed:", (jsonMatch[0] as string).substring(0, 200));
        }
      }
    }

    if (!extractedData) {
      return new Response(JSON.stringify({ error: "Falha ao extrair dados estruturados da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clinical-result error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
