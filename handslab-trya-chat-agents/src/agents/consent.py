"""
Agente de Consentimento - Solicita autorização do paciente para compartilhar dados.
"""
import os
import logging
from datetime import datetime
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)
call_count = 0


CONSENT_PROMPT = """Você é um agente de consentimento de dados de saúde.

Sua função é:
1. SEMPRE solicitar autorização explícita do paciente antes de compartilhar seus dados médicos
2. Explicar de forma clara e breve o que será compartilhado (resumo da conversa, sintomas, sugestões)
3. Aceitar respostas claras de autorização (sim, autorizo, pode, ok, tudo bem, etc.)
4. Aceitar respostas claras de recusa (não, não autorizo, não pode, negativo, etc.)

Se o paciente autorizar, responda EXATAMENTE: "AUTORIZADO"
Se o paciente recusar, responda EXATAMENTE: "RECUSADO"

Seja educado, empático e direto. Não force a decisão do paciente."""


class ConsentAgent:
    """Agente que solicita consentimento do paciente."""
    
    def __init__(self, model_id: Optional[str] = None, temperature: float = 0.7):
        """Inicializa o agente de consentimento com temperatura mais alta para conversa natural."""
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
        self.prompt = CONSENT_PROMPT
    
    def request_consent(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Solicita consentimento do paciente para compartilhar dados.
        """
        global call_count
        call_count += 1
        
        messages = state.get("messages", [])
        logger.info(f"\n{'='*60}")
        logger.info(f"CONSENT CALL #{call_count} - {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
        logger.info(f"Total de mensagens no estado: {len(messages)}")
        logger.info(f"{'='*60}")
        
        # Verifica se já fizemos a pergunta de consentimento
        consent_asked = False
        if len(messages) >= 2:
            # Procura pela mensagem de solicitação de consentimento
            for msg in messages[-3:]:  # Últimas 3 mensagens
                if isinstance(msg, AIMessage) and "Autorização de Compartilhamento" in msg.content:
                    consent_asked = True
                    break
        
        # Se já perguntamos, verifica a resposta
        if consent_asked and len(messages) > 0:
            last_msg = messages[-1]
            if isinstance(last_msg, HumanMessage):
                # Normaliza conteúdo para string
                content = last_msg.content
                if isinstance(content, list):
                    content = " ".join(str(item) for item in content)
                elif not isinstance(content, str):
                    content = str(content)
                content_lower = content.lower().strip()
                
                # Respostas claras de autorização (palavra única ou frase curta)
                if content_lower in ["sim", "autorizo", "pode", "ok", "tudo bem", "claro", "concordo", "aceito", "yes", "s"]:
                    logger.info("✅ Paciente autorizou compartilhamento de dados")
                    return {
                        "next": "summarizer",
                        "consent_status": "authorized",
                        "messages": []
                    }
                
                # Respostas claras de recusa (palavra única ou frase curta)
                if content_lower in ["não", "nao", "negativo", "recuso", "não autorizo", "nao autorizo", "no", "n"]:
                    logger.info("❌ Paciente recusou compartilhamento de dados")
                    return {
                        "next": "finish",
                        "is_complete": True,
                        "consent_status": "denied",
                        "messages": [AIMessage(content="Entendo sua decisão. Seus dados não serão compartilhados. Obrigado pelo contato e cuide-se! Até logo.")]
                    }
                
                # Resposta ambígua - pede esclarecimento
                logger.info("⚠️  Resposta ambígua, solicitando esclarecimento")
                return {
                    "messages": [AIMessage(content="Desculpe, não entendi sua resposta. Por favor, responda apenas 'Sim' para autorizar ou 'Não' para recusar o compartilhamento dos dados com o médico.")],
                    "next": "consent",
                    "consent_status": "pending"
                }
        
        # Primeira vez - solicita consentimento
        consent_message = (
            "\n📋 **Autorização de Compartilhamento de Dados**\n\n"
            "Coletamos informações importantes sobre seus sintomas e histórico. "
            "Para que possamos gerar um resumo médico estruturado e compartilhá-lo com o profissional de saúde, "
            "precisamos da sua autorização.\n\n"
            "**O que será compartilhado:**\n"
            "- Resumo da nossa conversa\n"
            "- Sintomas relatados\n"
            "- Queixa principal\n"
            "- Sugestões de exames\n\n"
            "**Você autoriza o compartilhamento dessas informações com o médico?**\n"
            "(Responda apenas: Sim ou Não)"
        )
        
        logger.info("📋 Solicitando consentimento do paciente")
        
        return {
            "messages": [AIMessage(content=consent_message)],
            "next": "consent",  # Aguarda resposta
            "consent_status": "pending"
        }
