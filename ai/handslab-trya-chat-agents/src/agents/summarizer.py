"""
Agente Resumidor - Cria um resumo estruturado para o médico.
"""
import os
import logging
from datetime import datetime
from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import json
import re
from typing import Dict, Any, Optional

from ..models.summary import MedicalSummary
from ..utils.text_utils import remove_emojis

logger = logging.getLogger(__name__)
call_count = 0


SUMMARIZER_PROMPT = """Você é um assistente de IA especializado em medicina. Sua tarefa é analisar uma conversa entre um agente de triagem e um paciente e criar um resumo claro e estruturado para um médico.

{onboarding_context}

Com base em todo o histórico da conversa fornecido, extraia as seguintes informações e formate-as de acordo com o modelo solicitado:

- **Resumo da conversa**: Um resumo conciso de toda a interação.
- **Sintomas Principais**: Uma lista dos sintomas chave que o paciente mencionou.
- **Queixa Principal**: A razão principal pela qual o paciente procurou ajuda, de forma direta.
- **Sugestão de exames** (suggested_exams): Analise sintomas + comorbidades + idade/gênero seguindo estes cenários:
  
  1. **Confirmação de Diagnóstico**: Sintomas clássicos que requerem confirmação laboratorial
     Ex: Febre + tosse → Teste rápido de Influenza, Strep A
  
  2. **Monitoramento de Condições Crônicas**: Paciente com doença crônica apresenta sintomas de descompensação
     Ex: Diabético com sede excessiva → HbA1c, Glicemia de Jejum
     Ex: Hipertenso com dor no peito → ECG, Troponina, Perfil Lipídico
  
  3. **Investigação de Sintomas Inespecíficos**: Sintomas vagos mas persistentes
     Ex: Fadiga crônica + perda de peso → Hemograma completo, TSH, Vitamina D
  
  4. **Análise de Risco Cardiovascular**: Múltiplos fatores de risco + sintomas atípicos
     Ex: Desconforto torácico em paciente de alto risco → ECG, Troponina, Perfil Lipídico
  
  5. **Protocolos por Idade/Gênero**: Sugestões preventivas baseadas em diretrizes
     Ex: Mulher 45+ sem check-up recente → Mamografia, Papanicolau
  
  Sugira 1-3 exames específicos. Deixe vazio APENAS se sintomas extremamente leves SEM comorbidades.
- **Alergias** (collected_allergies): Extraia TODAS as alergias mencionadas pelo paciente durante a conversa. Retorne como uma string única separada por vírgulas (ex: "Penicilina, Dipirona, Frutos do mar"). Retorne string vazia "" se o paciente não mencionou alergias ou disse que não tem alergias.
- **Medicamentos em uso** (collected_medications): Extraia TODOS os medicamentos que o paciente mencionou estar tomando atualmente. Retorne como lista de strings com os nomes dos medicamentos (ex: ["Losartana", "Metformina"]). Retorne lista vazia [] se o paciente não mencionou medicamentos ou disse que não toma nenhum.
- **Condições crônicas** (collected_chronic_conditions): Extraia TODAS as condições crônicas/doenças pré-existentes mencionadas pelo paciente (ex: diabetes, hipertensão, asma). Retorne como lista de strings. Retorne lista vazia [] se o paciente não mencionou condições crônicas.

- **Nível de Cuidado** (care_level): CONSIDERE AS COMORBIDADES ao classificar:
  - EMERGENCY_SAMU: Risco de vida, paciente não consegue se mover (dor no peito intensa + falta de ar, perda de consciência, convulsões, sangramento grave, AVC, anafilaxia)
  - EMERGENCY_HOSPITAL: Emergência mas paciente consegue se mover (dor no peito moderada em hipertenso, fratura sem sangramento, envenenamento leve, trauma ocular grave, sangramento ativo, dificuldade respiratória)
  - TELEMEDICINE: Sintomas agudos mas não emergenciais (resfriado, gripe, dor de garganta, febre baixa <38.5°C, náusea, erupções cutâneas leves)
  - IN_PERSON: Necessita exame físico ou acompanhamento NÃO URGENTE (dor persistente mas estável, investigação diagnóstica eletiva, check-up, procedimentos programados)
  
  IMPORTANTE: Se a recomendação mencionar "pronto-socorro", "imediato", "urgente", "hospital", USE EMERGENCY_HOSPITAL ou EMERGENCY_SAMU, NÃO IN_PERSON!

- **Nível de Urgência** (Protocolo de Manchester - urgency_level):
  - EMERGENCY (Vermelho): Risco de vida iminente
  - VERY_URGENT (Laranja): Muito urgente com risco potencial
  - URGENT (Amarelo): Urgente mas estável
  - STANDARD (Verde): Pouco urgente
  - NON_URGENT (Azul): Não urgente

- **Recomendação de Atendimento**: Baseado no care_level, indique onde buscar ajuda.
- **Orientações Básicas**: 3-5 dicas práticas (hidratação, repouso, alimentação). NÃO mencione medicamentos.

Histórico da Conversa:
{conversation_history}
"""


class SummarizerAgent:
    """Agente que resume a conversa para o médico."""

    def __init__(self, model_id: Optional[str] = None, temperature: float = 0.3):
        """
        Inicializa o agente resumidor.
        """
        if model_id is None:
            model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")

        from botocore.config import Config
        config = Config(
            retries={'max_attempts': 10, 'mode': 'adaptive'},
            read_timeout=300
        )

        self.llm = ChatBedrock(
            model=model_id,
            model_kwargs={"temperature": temperature},
            config=config
        )
        self.prompt_template = SUMMARIZER_PROMPT
        # Instruções para saída JSON estrita (evita uso de tools no Bedrock)
        self.json_instruction = (
            "Responda SOMENTE com um JSON válido, sem texto extra, no seguinte formato: "
            "{\n"
            "  \"conversation_summary\": \"string\",\n"
            "  \"main_symptoms\": [\"string\"],\n"
            "  \"chief_complaint\": \"string\",\n"
            "  \"suggested_exams\": [\"string\"],\n"
            "  \"care_level\": \"EMERGENCY_SAMU|EMERGENCY_HOSPITAL|TELEMEDICINE|IN_PERSON\",\n"
            "  \"urgency_level\": \"EMERGENCY|VERY_URGENT|URGENT|STANDARD|NON_URGENT\",\n"
            "  \"care_recommendation\": \"string\",\n"
            "  \"basic_care_instructions\": [\"string\"],\n"
            "  \"collected_allergies\": \"string (alergias separadas por vírgula, ou vazio)\",\n"
            "  \"collected_medications\": [\"string\"],\n"
            "  \"collected_chronic_conditions\": [\"string\"]\n"
            "}"
        )

    def summarize(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gera um resumo estruturado da conversa.
        """
        global call_count
        call_count += 1

        messages = state.get("messages", [])
        patient_data = state.get("patient_data", {})
        logger.info(f"\n{'='*60}")
        logger.info(f"SUMMARIZER CALL #{call_count} - {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
        logger.info(f"Total de mensagens no estado: {len(messages)}")
        logger.info(f"{'='*60}")

        # Monta contexto de onboarding se disponível
        onboarding_data = patient_data.get("onboarding_data", {})
        onboarding_context = ""
        if onboarding_data:
            parts = ["\n## INFORMAÇÕES PRÉVIAS DO PACIENTE (ONBOARDING):"]
            if chronic := onboarding_data.get("chronic_conditions"):
                parts.append(f"- **Condições Crônicas**: {', '.join(chronic)}")
            if meds := onboarding_data.get("medications"):
                parts.append(f"- **Medicamentos em Uso**: {', '.join(meds)}")
            if allergies := onboarding_data.get("allergies"):
                parts.append(f"- **Alergias**: {allergies}")
            onboarding_context = "\n".join(parts) + "\n"
            logger.info(f"📋 Incluindo dados de onboarding no resumo")

        # Formata o histórico da conversa
        conversation_history = self._format_messages(messages)
        prompt = self.prompt_template.format(
            onboarding_context=onboarding_context,
            conversation_history=conversation_history
        )

        # Adiciona análises de imagens ao contexto se existirem
        patient_data = state.get("patient_data", {})
        image_analyses = patient_data.get("image_analyses", [])
        
        image_context = ""
        if image_analyses:
            image_context = "\n\n## ANÁLISES DE IMAGENS ANEXADAS:\n"
            for idx, analysis in enumerate(image_analyses, 1):
                image_context += f"\n### Imagem {idx} ({analysis.get('timestamp', 'N/A')})\n"
                
                # Formata arquivos S3 como JSON para o contexto
                s3_files = analysis.get('s3_files', [])
                image_context += f"Arquivos S3: {json.dumps(s3_files, ensure_ascii=False)}\n"
                image_context += f"Contexto: {analysis.get('context', 'Sem contexto fornecido')}\n"
                image_context += f"Análise Detalhada:\n{analysis.get('detailed_analysis', 'Sem análise')}\n"
            
            prompt += image_context
            logger.info(f"📸 Incluindo {len(image_analyses)} análise(s) de imagem no resumo médico")
        
        # Gera o resumo estruturado sem tools, pedindo JSON estrito
        logger.info("⏳ Chamando Bedrock (Summarizer) para gerar resumo estruturado (JSON)...")
        try:
            # Use padrão igual aos outros agentes: System + Human
            system_msg = SystemMessage(content=prompt)
            human_msg = HumanMessage(content=self.json_instruction)
            resp = self.llm.invoke([system_msg, human_msg])
            logger.info("✅ Resumo recebido do Bedrock")

            # Normaliza resposta para string
            content = getattr(resp, "content", resp)
            if not isinstance(content, str):
                content = str(content)

            # Log do JSON bruto para debug
            logger.debug(f"📄 JSON bruto recebido: {content[:500]}...")

            # Extrai JSON da resposta
            data = self._extract_json(content)
            
            # Log dos exames sugeridos especificamente
            suggested_exams = data.get("suggested_exams", [])
            care_level = data.get("care_level", "IN_PERSON")
            logger.info(f"🔬 Exames sugeridos: {suggested_exams}")
            logger.info(f"🎯 Nível de cuidado: {care_level}")
            
            # Log do raciocínio se houver comorbidades
            if onboarding_data:
                chronic = onboarding_data.get("chronic_conditions", [])
                if chronic and suggested_exams:
                    logger.info(f"✅ Exames considerando comorbidades: {chronic}")
                elif chronic and not suggested_exams:
                    logger.warning(f"⚠️ Paciente com comorbidades ({chronic}) mas sem exames sugeridos")

            # Valida e normaliza com Pydantic
            summary_dict = self._validate_summary(data)

            # Extrai informações de urgência e cuidados
            care_level = summary_dict.get('care_level', 'IN_PERSON')
            urgency_level = summary_dict.get('urgency_level', 'STANDARD')
            care_recommendation = summary_dict.get('care_recommendation', '')
            care_instructions = summary_dict.get('basic_care_instructions', [])
            
            # 🔍 VALIDAÇÃO DE CONSISTÊNCIA: Detecta recomendações de emergência classificadas erroneamente
            emergency_keywords = [
                'pronto-socorro', 'pronto socorro', 'emergência', 'emergencia',
                'imediatamente', 'imediata', 'urgente', 'urgência', 'urgencia',
                'hospital', 'samu', '192', 'ambulância', 'ambulancia'
            ]
            recommendation_lower = care_recommendation.lower()
            has_emergency_keyword = any(keyword in recommendation_lower for keyword in emergency_keywords)
            
            if has_emergency_keyword and care_level == "IN_PERSON":
                logger.warning(f"⚠️ INCONSISTÊNCIA DETECTADA: care_recommendation contém palavras de emergência mas care_level=IN_PERSON")
                logger.warning(f"   Recomendação: '{care_recommendation}'")
                logger.warning(f"   Corrigindo care_level para EMERGENCY_HOSPITAL")
                care_level = "EMERGENCY_HOSPITAL"
                summary_dict['care_level'] = "EMERGENCY_HOSPITAL"

            # Gera mensagem de despedida natural usando a IA
            farewell_prompt = SystemMessage(content=f"""Você é um assistente de IA que organiza informações de saúde - NÃO é médico e NÃO faz diagnósticos.

Seu papel: ACOLHER o relato, ORGANIZAR as informações e EXPLICAR o próximo passo de forma simples.

Nível de urgência: {urgency_level}
Nível de cuidado: {care_level}
Recomendação: {care_recommendation}
Orientações: {chr(10).join('   - ' + instruction for instruction in care_instructions)}

ESTRUTURA OBRIGATÓRIA por care_level:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 EMERGENCY_SAMU ou EMERGENCY_HOSPITAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tom: URGENTE e DIRETO
NÃO mencione: "organizar informações", "enviar para médico", "análise"
IMPORTANTE: NÃO ofereça chamar ambulância ou ajuda - apenas instrua o paciente a ligar ou procurar ajuda
Estrutura:
1. Seja DIRETO sobre a EMERGÊNCIA
2. Instrução CLARA e IMEDIATA de onde buscar ajuda (ligar 192 ou ir ao hospital)
3. Dê orientações de segurança (das orientações fornecidas)
4. Deseje cuidado

Exemplo:
"Entendo que você está sentindo [sintoma principal]. É fundamental que você procure atendimento de emergência imediatamente! [Instrução específica: LIGUE 192 (SAMU) ou vá ao hospital mais próximo]. Não dirija. Enquanto espera, [orientação de segurança]. Desejo que você receba o cuidado necessário o mais rápido possível. Fique bem!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 TELEMEDICINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tom: PRÁTICO e ACOLHEDOR
NÃO mencione: "dados serão enviados", "análise médica", "agendar"
Estrutura:
1. Informe que telemedicina pode avaliar o caso
2. Dê 2-3 orientações práticas de autocuidado (das orientações fornecidas)
3. Deseje melhoras

Exemplo:
"Seus sintomas podem ser avaliados por telemedicina. Utilize a telemedicina para orientação médica. Enquanto isso, mantenha-se hidratado, descanse bastante e [mais 1-2 orientações]. Melhoras!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 IN_PERSON (Consulta Eletiva):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tom: ORGANIZADOR, não orientador médico
Estrutura EXATA (4 elementos):

1- ACOLHIMENTO (sem validar diagnóstico):
"Entendi o que você nos contou."

2- PRÓXIMO PASSO (simples e claro):
"Agora essas informações seguem para avaliação de um médico."

3- EXPECTATIVA:
"Você será avisado quando houver retorno."

4- (Opcional) Orientações gerais de cuidado (hidratação, repouso), sem mencionar medicamentos ou sintomas.

Exemplo completo:
"Entendi o que você nos contou. Agora essas informações seguem para avaliação de um médico. Você será avisado quando houver retorno."

Pode adicionar orientações gerais de cuidado (hidratação, repouso), mas NUNCA oriente sobre medicamentos, sintomas ou diagnóstico.

PROIBIDO em IN_PERSON:
❌ "Recomendo que você..."
❌ "Sugiro que você procure..."
❌ "É importante que..."
❌ Mencionar sintomas em detalhes
❌ Validar ou comentar sobre o estado de saúde

Máximo: 3-4 frases. Seja objetivo e empático.""")
            farewell_context = HumanMessage(content=f"Conversa resumida: {summary_dict.get('chief_complaint', 'sintomas relatados')}\n\nCrie a mensagem de despedida:")
            
            try:
                logger.info("⏳ Gerando mensagem de despedida natural...")
                farewell_response = self.llm.invoke([farewell_prompt, farewell_context])
                thank_text = getattr(farewell_response, "content", str(farewell_response)).strip()
                # Remove emojis da mensagem de despedida
                thank_text = remove_emojis(thank_text)
                logger.info(f"✅ Mensagem gerada: '{thank_text[:50]}...'")
            except Exception as e:
                logger.warning(f"⚠️ Erro ao gerar despedida: {e}; usando fallback")
                # Fallback diferenciado por care_level
                if care_level == "TELEMEDICINE":
                    thank_text = "Seus sintomas podem ser avaliados por telemedicina. Utilize a telemedicina para orientação médica. Enquanto isso, mantenha-se hidratado e descanse bastante. Melhoras!"
                elif care_level in ["EMERGENCY_SAMU", "EMERGENCY_HOSPITAL"]:
                    thank_text = "Procure atendimento de emergência IMEDIATAMENTE! Mantenha-se calmo e seguro."
                else:
                    thank_text = "Obrigado! Seus dados serão enviados para análise médica. Você será contatado em breve. Melhoras!"
            
            return {
                "medical_summary": summary_dict,
                "messages": [self._create_ai_message(thank_text)],
                "is_complete": True,
                "next": "finish"
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Erro ao gerar resumo: {error_msg}")
            
            # Retorna resumo de fallback baseado nos dados já coletados
            patient_data = state.get("patient_data", {})
            fallback_summary = {
                "conversation_summary": "Não foi possível gerar o resumo completo devido a limitações técnicas temporárias.",
                "main_symptoms": patient_data.get("symptoms", []),
                "chief_complaint": "Informação coletada durante a triagem (veja histórico de mensagens)",
                "suggested_exams": [],
                "care_level": "IN_PERSON",
                "urgency_level": "STANDARD",
                "care_recommendation": "Consultar um clínico geral para avaliação",
                "basic_care_instructions": ["Mantenha-se hidratado", "Descanse adequadamente", "Procure atendimento se os sintomas piorarem"],
                "collected_allergies": "",
                "collected_medications": [],
                "collected_chronic_conditions": []
            }
            
            thank_text = (
                "Obrigado pelo contato! Encerramos por aqui. Se os sintomas persistirem ou piorarem, procure atendimento médico."
            )
            return {
                "medical_summary": fallback_summary,
                "messages": [self._create_ai_message(thank_text)],
                "is_complete": True,
                "next": "finish"
            }

    def _create_ai_message(self, content: str) -> AIMessage:
        """Cria AIMessage com timestamp."""
        msg = AIMessage(content=content)
        msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
        return msg

    def _format_messages(self, messages: list) -> str:
        """Formata mensagens para apresentação ao resumidor."""
        formatted = []
        for msg in messages:
            role = msg.__class__.__name__.replace("Message", "")
            content = msg.content
            formatted.append(f"{role}: {content}")
        return "\n".join(formatted)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Tenta extrair JSON válido da resposta em texto."""
        # 1) Tentativa direta
        try:
            return json.loads(text)
        except Exception:
            pass
        # 2) Bloco entre ```json ... ```
        match = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", text, re.IGNORECASE)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        # 3) Heurística: do primeiro '{' até o último '}'
        try:
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start:end+1])
        except Exception:
            pass
        # 4) Fallback vazio
        return {
            "conversation_summary": "",
            "main_symptoms": [],
            "chief_complaint": "",
            "suggested_exams": [],
            "collected_allergies": "",
            "collected_medications": [],
            "collected_chronic_conditions": []
        }

    def _validate_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Valida o dicionário contra o modelo Pydantic e retorna dict."""
        # Garante chaves esperadas
        cleaned = {
            "conversation_summary": data.get("conversation_summary", ""),
            "main_symptoms": data.get("main_symptoms", []) or [],
            "chief_complaint": data.get("chief_complaint", ""),
            "suggested_exams": data.get("suggested_exams", []) or [],
            "care_level": data.get("care_level", "IN_PERSON"),
            "urgency_level": data.get("urgency_level", "STANDARD"),
            "care_recommendation": data.get("care_recommendation", ""),
            "basic_care_instructions": data.get("basic_care_instructions", []) or [],
            # Novos campos para dados de saúde coletados
            "collected_allergies": data.get("collected_allergies", ""),
            "collected_medications": data.get("collected_medications", []) or [],
            "collected_chronic_conditions": data.get("collected_chronic_conditions", []) or []
        }
        # Normaliza tipos
        if not isinstance(cleaned["main_symptoms"], list):
            cleaned["main_symptoms"] = [str(cleaned["main_symptoms"])[:200]]
        if not isinstance(cleaned["suggested_exams"], list):
            cleaned["suggested_exams"] = [str(cleaned["suggested_exams"])[:200]]
        if not isinstance(cleaned["basic_care_instructions"], list):
            cleaned["basic_care_instructions"] = [str(cleaned["basic_care_instructions"])[:300]]
        # Normaliza novos campos
        if not isinstance(cleaned["collected_allergies"], str):
            cleaned["collected_allergies"] = str(cleaned["collected_allergies"]) if cleaned["collected_allergies"] else ""
        if not isinstance(cleaned["collected_medications"], list):
            cleaned["collected_medications"] = [str(cleaned["collected_medications"])[:200]] if cleaned["collected_medications"] else []
        if not isinstance(cleaned["collected_chronic_conditions"], list):
            cleaned["collected_chronic_conditions"] = [str(cleaned["collected_chronic_conditions"])[:200]] if cleaned["collected_chronic_conditions"] else []

        # Valida com Pydantic (v2 e fallback v1) - apenas campos do MedicalSummary
        pydantic_fields = {
            "conversation_summary": cleaned["conversation_summary"],
            "main_symptoms": cleaned["main_symptoms"],
            "chief_complaint": cleaned["chief_complaint"],
            "suggested_exams": cleaned["suggested_exams"],
            "urgency_level": cleaned["urgency_level"],
            "care_recommendation": cleaned["care_recommendation"],
            "basic_care_instructions": cleaned["basic_care_instructions"]
        }
        try:
            model = MedicalSummary.model_validate(pydantic_fields)  # type: ignore[attr-defined]
            try:
                validated = model.model_dump()  # pydantic v2
            except AttributeError:
                validated = model.dict()  # pydantic v1
            # Adiciona campos coletados ao resultado
            validated["collected_allergies"] = cleaned["collected_allergies"]
            validated["collected_medications"] = cleaned["collected_medications"]
            validated["collected_chronic_conditions"] = cleaned["collected_chronic_conditions"]
            return validated
        except Exception:
            return cleaned
