"""
Agente de Onboarding - Coleta condições crônicas, medicamentos e alergias.
"""
import os
import logging
from typing import Dict, Any
from datetime import datetime
from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage, AIMessage
from botocore.config import Config

from ..utils.text_utils import remove_emojis

logger = logging.getLogger(__name__)

ONBOARDING_PROMPT = """Você está coletando informações importantes do paciente.

Você precisa coletar as seguintes informações de forma natural e empática:
1. Condições crônicas (diabetes, hipertensão, asma, etc)
2. Medicamentos que toma regularmente
3. Alergias (medicamentos, alimentos, etc)

INSTRUÇÕES:
- Faça UMA pergunta por vez
- Seja empático e acolhedor
- NÃO se apresente como "assistente de saúde" - vá direto ao ponto
- Se o paciente disser que não tem algo, aceite e passe para próxima pergunta
- Quando tiver todas as 3 informações, agradeça brevemente

FORMATO DE RESPOSTA:
Responda SEMPRE com um JSON válido (sem markdown, sem ```json):
{
  "message": "sua mensagem para o paciente",
  "collected_data": {
    "chronic_conditions": ["lista", "de", "condições"] ou null,
    "medications": ["lista", "de", "medicamentos"] ou null,
    "allergies": "texto com alergias" ou null
  },
  "is_complete": true ou false
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem texto adicional
- Se ainda não coletou alguma informação, deixe como null
- Marque is_complete=true APENAS quando tiver as 3 informações
- Se paciente disser "não tenho" ou "nenhum", registre como lista vazia [] ou string vazia ""
"""


class OnboardingAgent:
    """Agente responsável por coletar dados de onboarding do paciente."""
    
    def __init__(self, model_id: str = None, temperature: float = 0.7):
        if model_id is None:
            model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
        
        config = Config(
            retries={'max_attempts': 10, 'mode': 'adaptive'},
            read_timeout=300
        )
        
        self.llm = ChatBedrock(
            model=model_id,
            model_kwargs={
                "temperature": temperature,
                "max_tokens": 500
            },
            config=config
        )
    
    def collect(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coleta dados de onboarding do paciente.
        
        Args:
            state: Estado atual da conversa
            
        Returns:
            Estado atualizado com dados de onboarding
        """
        messages = state.get("messages", [])
        patient_data = state.get("patient_data", {})
        onboarding_data = patient_data.get("onboarding_data", {})
        
        try:
            agent_messages = [SystemMessage(content=ONBOARDING_PROMPT)]
            
            # Adiciona contexto do que já foi coletado
            if onboarding_data:
                context = f"\n\nDados já coletados: {onboarding_data}"
                agent_messages[0].content += context
            
            agent_messages.extend(messages)
            
            response = self.llm.invoke(agent_messages)
            
            # Parse da resposta JSON
            import json
            response_text = response.content.strip()
            
            # Valida se há conteúdo
            if not response_text:
                logger.error("❌ Resposta vazia do modelo")
                raise ValueError("Resposta vazia do modelo")
            
            # Remove markdown se houver
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            # Log para debug
            logger.debug(f"📝 Resposta do modelo: {response_text[:200]}...")
            
            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"❌ Erro ao parsear JSON: {e}")
                logger.error(f"📄 Conteúdo recebido: {response_text}")
                
                # Fallback: Claude retornou texto puro, cria JSON manualmente
                logger.warning("⚠️ Claude retornou texto puro, criando JSON manualmente")
                
                # Usa o texto como mensagem e infere o que foi coletado
                response_data = {
                    "message": response_text,
                    "collected_data": {},
                    "is_complete": False
                }
                
                # Tenta inferir o que foi coletado baseado no contexto
                text_lower = response_text.lower()
                if "alergia" in text_lower:
                    # Está perguntando sobre alergias, então já tem condições e medicamentos
                    if onboarding_data.get("chronic_conditions") is None:
                        response_data["collected_data"]["chronic_conditions"] = []
                    if onboarding_data.get("medications") is None:
                        response_data["collected_data"]["medications"] = []
                elif "medicamento" in text_lower:
                    # Está perguntando sobre medicamentos, então já tem condições
                    if onboarding_data.get("chronic_conditions") is None:
                        response_data["collected_data"]["chronic_conditions"] = []
            
            # Atualiza onboarding_data
            collected = response_data.get("collected_data", {})
            if collected.get("chronic_conditions") is not None:
                onboarding_data["chronic_conditions"] = collected["chronic_conditions"]
            if collected.get("medications") is not None:
                onboarding_data["medications"] = collected["medications"]
            if collected.get("allergies") is not None:
                onboarding_data["allergies"] = collected["allergies"]
            
            patient_data["onboarding_data"] = onboarding_data
            
            # Verifica se está completo
            is_complete = response_data.get("is_complete", False)
            if is_complete:
                patient_data["onboarding_complete"] = True
                logger.info("✅ Onboarding completo")
                
                # Busca sintomas mencionados ANTES do onboarding começar
                # Ignora a primeira mensagem (geralmente saudação) e respostas de onboarding
                initial_symptoms = []
                found_onboarding_start = False
                
                for i, msg in enumerate(messages):
                    if msg.__class__.__name__ == "HumanMessage":
                        content_lower = msg.content.lower()
                        
                        # Detecta quando começou o onboarding (pergunta sobre condições crônicas)
                        if i > 0:  # Pula primeira mensagem
                            prev_msg = messages[i-1]
                            if prev_msg.__class__.__name__ == "AIMessage":
                                prev_content_lower = prev_msg.content.lower()
                                if any(word in prev_content_lower for word in ["condição crônica", "diabetes", "hipertensão", "medicamento", "alergia"]):
                                    found_onboarding_start = True
                        
                        # Se ainda não começou onboarding e não é saudação, captura como sintoma
                        if not found_onboarding_start and i > 0:
                            # Ignora saudações simples
                            if content_lower not in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"]:
                                initial_symptoms.append(msg.content)
                
                # Mensagem de transição gerada por IA
                from langchain_core.messages import HumanMessage
                
                if initial_symptoms and len(initial_symptoms) > 0:
                    symptoms_text = " ".join(initial_symptoms)
                    transition_prompt = SystemMessage(content="""Você é um assistente de triagem médica empático.
O paciente acabou de fornecer dados de onboarding (condições crônicas, medicamentos, alergias).
Ele mencionou sintomas ANTES do onboarding começar.

Crie UMA mensagem curta e natural (2-3 frases) que:
1. Agradeça brevemente
2. Retome os sintomas mencionados
3. Peça mais detalhes

NÃO mencione dados do onboarding (condições crônicas, medicamentos). Foque apenas nos sintomas atuais.""")
                    transition_context = HumanMessage(content=f"Sintomas iniciais: {symptoms_text}")
                else:
                    transition_prompt = SystemMessage(content="""Você é um assistente de triagem médica empático.
O paciente acabou de fornecer dados de onboarding (condições crônicas, medicamentos, alergias).
Ele NÃO mencionou sintomas antes.

Crie UMA mensagem curta e natural (2-3 frases) que:
1. Agradeça brevemente
2. Pergunte sobre sintomas atuais

Seja direto e empático.""")
                    transition_context = HumanMessage(content="Crie a mensagem:")
                
                try:
                    transition_response = self.llm.invoke([transition_prompt, transition_context])
                    transition_msg = transition_response.content.strip()
                    # Remove emojis da mensagem de transição
                    transition_msg = remove_emojis(transition_msg)
                    logger.info(f"✅ Transição gerada: '{transition_msg[:50]}...'")
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao gerar transição: {e}")
                    if initial_symptoms:
                        symptoms_text = " ".join(initial_symptoms)
                        transition_msg = f"Obrigado! Agora me conte mais sobre: {symptoms_text}. Quais sintomas você está sentindo?"
                    else:
                        transition_msg = "Obrigado pelas informações! Agora me conte, o que está sentindo hoje?"
                
                response_data["message"] = transition_msg
            
            return {
                "messages": messages + [self._create_ai_message(remove_emojis(response_data["message"]))],
                "patient_data": patient_data,
                "next": "supervisor"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Erro JSON não tratado: {str(e)}")
            fallback_message = "Entendi. Você tem alguma condição crônica como diabetes ou hipertensão?"
            if onboarding_data.get("chronic_conditions") is not None:
                fallback_message = "Você toma algum medicamento regularmente?"
            elif onboarding_data.get("medications") is not None:
                fallback_message = "Você tem alguma alergia a medicamentos ou alimentos?"
            return {
                "messages": messages + [self._create_ai_message(fallback_message)],
                "patient_data": patient_data,
                "next": "supervisor"
            }
            
        except Exception as e:
            logger.error(f"❌ Erro no onboarding: {str(e)}", exc_info=True)
            friendly_message = "Desculpe, tive um problema ao processar suas informações. Poderia repetir?"
            
            return {
                "messages": messages + [self._create_ai_message(friendly_message)],
                "patient_data": patient_data,
                "next": "supervisor"
            }
    
    def _create_ai_message(self, content: str) -> AIMessage:
        """Cria AIMessage com timestamp."""
        msg = AIMessage(content=content)
        msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
        return msg
