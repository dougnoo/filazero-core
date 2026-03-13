import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRUCTURING_PROMPT = `Você é o Agente Estruturador Clínico do FilaZero. Você recebe a transcrição completa de uma conversa entre um paciente e o Agente Clínico do SUS.

Sua tarefa é gerar um JSON estruturado com a análise clínica completa. Use o tool calling para retornar os dados.

## Protocolo de Classificação de Risco (Manchester)
- EMERGENCY: Risco de vida imediato
- VERY_URGENT: Risco alto, precisa de atenção imediata
- URGENT: Condição que precisa de atenção nas próximas horas
- LESS_URGENT: Condição estável
- NON_URGENT: Rotina

## Regras
- Extraia TODAS as informações clínicas mencionadas na conversa
- Gere hipóteses diagnósticas baseadas nos sintomas (NÃO são diagnósticos finais)
- Sugira exames pré-consulta relevantes com códigos SIGTAP quando possível
- A recomendação de encaminhamento deve considerar resolutividade na atenção primária
- priorityScore é de 0 a 100 (100 = máxima urgência)
- confidence é de 0 a 100 (confiança na recomendação)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build conversation transcript
    const transcript = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "PACIENTE" : "AGENTE"}: ${m.content}`
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
            { role: "system", content: STRUCTURING_PROMPT },
            {
              role: "user",
              content: `Analise esta conversa clínica e gere o resultado estruturado:\n\n${transcript}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_clinical_result",
                description:
                  "Gera o resultado clínico estruturado a partir da conversa",
                parameters: {
                  type: "object",
                  properties: {
                    chiefComplaint: {
                      type: "string",
                      description: "Queixa principal do paciente",
                    },
                    symptoms: {
                      type: "array",
                      items: { type: "string" },
                      description: "Lista de sintomas identificados",
                    },
                    symptomDuration: {
                      type: "string",
                      description: "Duração dos sintomas",
                    },
                    painScale: {
                      type: "number",
                      description: "Escala de dor 0-10",
                    },
                    currentMedications: {
                      type: "array",
                      items: { type: "string" },
                      description: "Medicamentos em uso",
                    },
                    allergies: {
                      type: "array",
                      items: { type: "string" },
                      description: "Alergias conhecidas",
                    },
                    chronicConditions: {
                      type: "array",
                      items: { type: "string" },
                      description: "Doenças crônicas",
                    },
                    familyHistory: {
                      type: "array",
                      items: { type: "string" },
                      description: "Histórico familiar relevante",
                    },
                    riskLevel: {
                      type: "string",
                      enum: [
                        "EMERGENCY",
                        "VERY_URGENT",
                        "URGENT",
                        "LESS_URGENT",
                        "NON_URGENT",
                      ],
                      description: "Classificação de risco Manchester",
                    },
                    priorityScore: {
                      type: "number",
                      description: "Score de prioridade 0-100",
                    },
                    clinicalSummary: {
                      type: "object",
                      properties: {
                        narrative: {
                          type: "string",
                          description: "Resumo clínico narrativo",
                        },
                        structuredFindings: {
                          type: "array",
                          items: { type: "string" },
                          description: "Achados estruturados",
                        },
                        suspectedConditions: {
                          type: "array",
                          items: { type: "string" },
                          description: "Hipóteses diagnósticas",
                        },
                        riskFactors: {
                          type: "array",
                          items: { type: "string" },
                          description: "Fatores de risco identificados",
                        },
                        relevantHistory: {
                          type: "string",
                          description: "Histórico relevante filtrado",
                        },
                      },
                      required: [
                        "narrative",
                        "structuredFindings",
                        "suspectedConditions",
                        "riskFactors",
                      ],
                    },
                    examSuggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          examName: { type: "string" },
                          examCode: { type: "string" },
                          category: {
                            type: "string",
                            enum: [
                              "LABORATORY",
                              "IMAGING",
                              "FUNCTIONAL",
                              "OTHER",
                            ],
                          },
                          priority: {
                            type: "string",
                            enum: ["URGENT", "ROUTINE"],
                          },
                          justification: { type: "string" },
                        },
                        required: [
                          "examName",
                          "category",
                          "priority",
                          "justification",
                        ],
                      },
                      description: "Exames sugeridos para pré-consulta",
                    },
                    referralRecommendation: {
                      type: "object",
                      properties: {
                        decision: {
                          type: "string",
                          enum: [
                            "RESOLVE_PRIMARY",
                            "REFER_SPECIALIST",
                            "REFER_EMERGENCY",
                            "NEEDS_MORE_DATA",
                          ],
                        },
                        confidence: { type: "number" },
                        specialty: { type: "string" },
                        justification: { type: "string" },
                        requiredExamsBeforeReferral: {
                          type: "array",
                          items: { type: "string" },
                        },
                        alternativeActions: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: [
                        "decision",
                        "confidence",
                        "justification",
                        "requiredExamsBeforeReferral",
                      ],
                    },
                  },
                  required: [
                    "chiefComplaint",
                    "symptoms",
                    "riskLevel",
                    "priorityScore",
                    "clinicalSummary",
                    "examSuggestions",
                    "referralRecommendation",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_clinical_result" },
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro no gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: "Falha ao extrair dados estruturados da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
