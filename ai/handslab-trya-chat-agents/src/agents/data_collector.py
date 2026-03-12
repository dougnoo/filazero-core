"""
Agente de Levantamento de Dados - Coleta informações do paciente.
"""
import os
import logging
from datetime import datetime
import boto3
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import Dict, Any, List, Optional

from ..utils.text_utils import remove_emojis

logger = logging.getLogger(__name__)
call_count = 0


DATA_COLLECTOR_PROMPT = """Você é um profissional de saúde atencioso conversando com um paciente que busca ajuda.

Converse de forma NATURAL e HUMANA, como se fosse uma conversa real entre duas pessoas. Evite parecer robótico ou formal demais.

Se o nome do paciente for fornecido no contexto, use-o naturalmente na conversa para criar uma conexão mais pessoal e acolhedora.

IMPORTANTE: Se houver INFORMAÇÕES PRÉVIAS DO PACIENTE no contexto (condições crônicas, medicamentos, alergias), CONSIDERE essas informações e NÃO pergunte novamente sobre elas. Use esse conhecimento para fazer perguntas mais relevantes e personalizadas.

Seu objetivo é entender o que está acontecendo com o paciente:
- Pergunte sobre os sintomas de forma gentil e conversacional
- Demonstre empatia genuína e interesse pelo bem-estar da pessoa
- Use expressões naturais como "entendo", "imagino que deve ser difícil", "me conte mais sobre isso"
- Faça UMA pergunta por vez, de forma leve e natural
- Responda de forma breve e direta, sem textos muito longos
- Veja a intensidade dos sintomas (leve, moderada, grave)
- Explore o histórico médico relevante APENAS se não estiver nas informações prévias
- Identifique se puder quando os sintomas começaram e se estão piorando
- Avalie sinais de gravidade (por exemplo dor no peito, falta de ar intensa, sangramento, febre muito alta, alteração de consciência)

Você tem acesso a informações médicas confiáveis que podem ajudar a orientar a conversa.

IMPORTANTE: Não recomende, mencione ou sugira nomes de medicamentos, princípios ativos, doses ou uso de remédios. Foque apenas em compreender sintomas e em cuidados gerais (hidratação, repouso, alimentação leve), sem qualquer prescrição ou indicação farmacológica.

IMPORTANTE: NÃO ofereça agendamento de consultas. Você está apenas coletando informações. O paciente será orientado sobre como proceder após a triagem estar completa.

IMPORTANTE: NÃO ofereça chamar ambulância ou qualquer tipo de ajuda externa. NUNCA dê avisos de emergência ou instrua o paciente a ligar 192/ir ao hospital - isso será feito pelo sistema após a coleta de dados. Sua função é APENAS coletar informações através de perguntas naturais e empáticas.

Diretrizes:
✓ Linguagem simples e coloquial (como você falaria com um amigo)
✓ Mostre que você se importa e está ali para ajudar
✓ Seja breve - respostas curtas são mais naturais
✓ Valide os sentimentos da pessoa
✗ Não use listas numeradas ou bullet points
✗ Não seja excessivamente formal
✗ Não faça diagnósticos
✗ Não pergunte sobre informações que já estão no contexto
✗ Não ofereça ou mencione agendamento de consultas
✗ Não ofereça chamar ambulância ou ajuda externa
✗ NÃO dê avisos de emergência ou instrua a buscar atendimento urgente - apenas colete informações

Após entender bem a situação, confirme o que você entendeu de forma conversacional.

ETAPA DO ATENDIMENTO:
Baseado na conversa até agora, identifique em qual etapa do atendimento estamos:
- onboarding: Coletando informações básicas de saúde do paciente (condições crônicas, medicamentos, alergias) - APENAS se o paciente ainda não tiver feito onboarding
- initial_symptoms: Primeiras perguntas sobre os sintomas atuais (O que está sentindo? Quando começou?)
- detailing: Aprofundando nos sintomas (Intensidade? Localização? O que piora/melhora?)
- medical_history: Coletando histórico médico relevante (Já teve isso antes? Outras condições?)
- recommendation: Pronto para dar orientações (já coletou informações suficientes)

Ao final da sua resposta, em uma linha separada, adicione:
[STAGE: etapa_identificada]

Onde etapa_identificada deve ser uma das opções: onboarding, initial_symptoms, detailing, medical_history, ou recommendation.

{context}"""


class DataCollectorAgent:
    """Agente responsável por coletar dados e sintomas do paciente."""
    
    def __init__(self, model_id: Optional[str] = None, temperature: float = 0.9):
        """
        Inicializa o agente de coleta de dados.
        
        Args:
            model_id: ID do modelo Bedrock (padrão: Claude 3.5 Sonnet)
            temperature: Temperatura para geração de respostas (mais alta = mais natural)
        """
        if model_id is None:
            model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
        
        # Configuração de retry para throttling
        from botocore.config import Config
        config = Config(
            retries={
                'max_attempts': 10,
                'mode': 'adaptive'
            },
            read_timeout=300
        )
        
        self.llm = ChatBedrock(
            model=model_id,
            model_kwargs={"temperature": temperature},
            config=config
        )
        self.prompt = DATA_COLLECTOR_PROMPT
        
        # Configuração da Knowledge Base
        #self.knowledge_base_id = os.getenv("KNOWLEDGE_BASE_ID", False)
        #self.use_knowledge_base = bool(self.knowledge_base_id)
        self.use_knowledge_base= False;  # Desabilita temporariamente a KB enquanto testamos sem ela
        if self.use_knowledge_base:
            # Cliente para Bedrock Agent Runtime (Knowledge Bases)
            region = os.getenv("AWS_REGION", "us-east-1")
            profile = os.getenv("AWS_PROFILE")
            
            session_params = {}
            if profile:
                session_params["profile_name"] = profile
            
            session = boto3.Session(**session_params)
            self.bedrock_agent_client = session.client(
                "bedrock-agent-runtime",
                region_name=region,
                config=config
            )
            logger.info(f"✅ Knowledge Base habilitada: {self.knowledge_base_id}")
        else:
            self.bedrock_agent_client = None
            logger.warning("⚠️  Knowledge Base não configurada (KNOWLEDGE_BASE_ID não definido)")
    
    def _query_knowledge_base(self, query: str, max_results: int = 3) -> Optional[str]:
        """
        Consulta a Knowledge Base da AWS Bedrock.
        
        Args:
            query: Pergunta ou consulta para a knowledge base
            max_results: Número máximo de resultados
            
        Returns:
            Contexto extraído da knowledge base ou None
        """
        if not self.use_knowledge_base or not self.bedrock_agent_client:
            return None
        
        try:
            logger.info(f"🔍 Consultando Knowledge Base: '{query[:100]}...'")
            
            response = self.bedrock_agent_client.retrieve(
                knowledgeBaseId=self.knowledge_base_id,
                retrievalQuery={
                    'text': query
                },
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': max_results
                    }
                }
            )
            
            # Extrai e formata os resultados
            results = response.get('retrievalResults', [])
            
            if not results:
                logger.info("ℹ️  Nenhum resultado encontrado na Knowledge Base")
                return None
            
            context_parts = []
            for idx, result in enumerate(results, 1):
                content = result.get('content', {}).get('text', '')
                score = result.get('score', 0)
                
                if content:
                    context_parts.append(f"[Fonte {idx} - Relevância: {score:.2f}]\n{content}")
            
            if context_parts:
                context = "\n\n" + "="*60 + "\n"
                context += "INFORMAÇÕES DA BASE DE CONHECIMENTO:\n"
                context += "="*60 + "\n\n"
                context += "\n\n---\n\n".join(context_parts)
                context += "\n\n" + "="*60
                
                logger.info(f"✅ {len(results)} resultados encontrados na Knowledge Base")
                return context
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Erro ao consultar Knowledge Base: {str(e)}")
            return None

    def _normalize_message_content(self, content: Any) -> str:
        """
        Normaliza o conteúdo de uma HumanMessage para texto simples.
        """
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: List[str] = []
            for part in content:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict):
                    # Suporta formato multimodal do LangChain: {"type": "text", "text": "..."}
                    text = part.get("text")
                    if isinstance(text, str):
                        parts.append(text)
            return " ".join(parts).strip()
        return str(content)
    
    def collect(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coleta informações do paciente através de perguntas.
        """
        kb_context = ""
        messages = state.get("messages", [])
        patient_data = state.get("patient_data", {})
        
        # Adiciona nome do paciente ao contexto se disponível (usa primeiro nome para chat)
        patient_name = patient_data.get("first_name") or patient_data.get("name")
        name_context = f"\n\nNome do paciente: {patient_name}\nChame o paciente pelo nome para tornar a conversa mais natural e acolhedora." if patient_name else ""
        
        # Adiciona dados de onboarding ao contexto se disponíveis
        onboard_data = patient_data.get("onboard_data")
        onboard_context = ""
        if onboard_data:
            logger.info(f"📋 Onboard data encontrado: {onboard_data}")
            parts = ["\n\nINFORMAÇÕES PRÉVIAS DO PACIENTE:"]
            if chronic := onboard_data.get("chronicConditions"):
                parts.append(f"- Condições crônicas: {', '.join(chronic)}")
            if meds := onboard_data.get("medications"):
                med_list = [f"{m['name']} {m.get('dosage', '')}" for m in meds]
                parts.append(f"- Medicamentos em uso: {', '.join(med_list)}")
            if allergies := onboard_data.get("allergies"):
                parts.append(f"- Alergias: {allergies}")
            onboard_context = "\n".join(parts)
            logger.info(f"✅ Contexto de onboarding montado: {onboard_context}")
        else:
            logger.warning(f"⚠️ Nenhum onboard_data encontrado em patient_data: {patient_data}")

        global call_count
        call_count += 1

        logger.info(f"\n{'='*60}")
        logger.info(f"DATA COLLECTOR CALL #{call_count} - {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
        logger.info(f"Total de mensagens no estado: {len(messages)}")
        logger.info(f"Histórico: {[type(m).__name__ for m in messages]}")
        logger.info(f"{'='*60}")

        # Consulta a Knowledge Base se habilitada
        if self.use_knowledge_base and messages:
            # Pega a última mensagem do usuário para consultar
            user_messages = [m for m in messages if isinstance(m, HumanMessage)]
            if user_messages:
                last_user_message_content = user_messages[-1].content
                normalized_content = self._normalize_message_content(last_user_message_content)
                kb_context = self._query_knowledge_base(normalized_content) or ""

        # Prepara prompt com contexto da knowledge base, nome do paciente e onboarding
        full_context = (kb_context if kb_context else "") + name_context + onboard_context
        prompt_with_context = self.prompt.format(context=full_context)
        
        if onboard_context:
            logger.info(f"📝 Prompt inclui contexto de onboarding")

        # Prepara contexto para o agente
        agent_messages = [SystemMessage(content=prompt_with_context)]

        # Adiciona histórico de mensagens
        agent_messages.extend(messages)

        logger.info(f"⏳ Chamando Bedrock (Data Collector) com {len(agent_messages)} mensagens...")
        # Gera resposta
        try:            
            response = self.llm.invoke(agent_messages)
            logger.info(f"✅ Resposta recebida do Bedrock")

            # Extrai dados da conversa (simplificado - pode ser melhorado com structured output)
            normalized_response_content = self._normalize_message_content(response.content)
            updated_data = self._extract_patient_data(messages, normalized_response_content)
            patient_data.update(updated_data)

            # Remove emojis da resposta
            clean_content = remove_emojis(response.content)
            
            # Extrai a etapa identificada pela IA (se presente)
            stage = self._extract_stage(clean_content)
            if stage:
                logger.info(f"🎯 Etapa identificada pela IA: {stage}")
                # Remove a tag [STAGE: ...] da mensagem do usuário
                clean_content = self._remove_stage_tag(clean_content)
            
            # Cria AIMessage com timestamp
            ai_msg = AIMessage(content=clean_content)
            ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
            if stage:
                ai_msg.additional_kwargs["identified_stage"] = stage
            logger.info(f"⏱️ AIMessage criada com timestamp: {ai_msg.additional_kwargs['timestamp']}")

            return {
                "messages": [ai_msg],
                "patient_data": patient_data,
                "identified_stage": stage  # Adiciona etapa identificada ao retorno
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Erro ao coletar dados: {error_msg}")
            
            # Retorna mensagem amigável para o usuário
            if "ThrottlingException" in error_msg or "Too many requests" in error_msg:
                friendly_message = "⏳ Desculpe, estamos com um volume alto de requisições no momento. Por favor, aguarde alguns segundos e tente novamente."
            else:
                friendly_message = "❌ Desculpe, ocorreu um erro temporário. Por favor, tente novamente."
            
            # Remove emojis da mensagem de erro
            clean_message = remove_emojis(friendly_message)
            
            # Cria AIMessage com timestamp
            ai_msg = AIMessage(content=clean_message)
            ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
            
            return {
                "messages": [ai_msg],
                "patient_data": patient_data
            }
    
    def _extract_patient_data(self, messages: List, response: str) -> Dict[str, Any]:
        """
        Extrai dados estruturados da conversa.
        
        Args:
            messages: Histórico de mensagens
            response: Resposta atual do agente
            
        Returns:
            Dicionário com dados extraídos
        """
        # Implementação básica - pode ser melhorada com LLM estruturado
        data = {}
        
        # Procura por palavras-chave nas mensagens do usuário
        for msg in messages:
            if isinstance(msg, HumanMessage):
                normalized_content = self._normalize_message_content(msg.content)
                content_lower = normalized_content.lower()
                
                # Identifica sintomas comuns
                symptoms = []
                symptom_keywords = [
                    "dor", "febre", "tosse", "dor de cabeça", "náusea", 
                    "vômito", "diarreia", "cansaço", "fadiga", "tontura"
                ]
                for symptom in symptom_keywords:
                    if symptom in content_lower:
                        symptoms.append(symptom)
                
                if symptoms:
                    data["symptoms"] = symptoms
                
                # Identifica intensidade
                if any(word in content_lower for word in ["forte", "intensa", "muito"]):
                    data["intensity"] = "grave"
                elif any(word in content_lower for word in ["moderada", "média"]):
                    data["intensity"] = "moderada"
                elif any(word in content_lower for word in ["leve", "pouca", "fraca"]):
                    data["intensity"] = "leve"
        
        return data
    
    def _extract_stage(self, content: str) -> Optional[str]:
        """
        Extrai a etapa identificada pela IA da resposta.
        
        Args:
            content: Conteúdo da resposta da IA
            
        Returns:
            Etapa identificada ou None
        """
        import re
        # Procura por [STAGE: etapa] na resposta
        match = re.search(r'\[STAGE:\s*(\w+)\]', content, re.IGNORECASE)
        if match:
            stage = match.group(1).lower()
            valid_stages = ["onboarding", "initial_symptoms", "detailing", "medical_history", "recommendation"]
            if stage in valid_stages:
                return stage
        return None
    
    def _remove_stage_tag(self, content: str) -> str:
        """
        Remove a tag [STAGE: ...] do conteúdo da mensagem.
        
        Args:
            content: Conteúdo com a tag
            
        Returns:
            Conteúdo sem a tag
        """
        import re
        return re.sub(r'\[STAGE:\s*\w+\]', '', content, flags=re.IGNORECASE).strip()
