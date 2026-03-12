"""
Agente Supervisor - Coordena o atendimento ao paciente.
"""
import os
import logging
from datetime import datetime
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import Dict, Any, Optional

from ..utils.text_utils import remove_emojis

logger = logging.getLogger(__name__)
call_count = 0


SUPERVISOR_PROMPT = """Você é um agente supervisor de triagem de saúde.

IMPORTANTE: Você receberá o STATUS DE IMAGENS e STATUS DE ONBOARDING no contexto.

REGRAS DE PRIORIDADE (em ordem):
1. Se STATUS DE ONBOARDING = "PENDENTE" → escolha `onboarding`
2. Se STATUS DE IMAGENS = "SEM IMAGENS PENDENTES" E já há 📸 no histórico → NUNCA escolha `image_analyzer`
3. Se ainda faltam informações sobre sintomas → escolha `data_collector`
4. Se já tem dados suficientes → escolha `summarizer`
5. Se paciente quer encerrar → escolha `finish`

PROIBIDO:
- ❌ NÃO escolha `image_analyzer` se STATUS = "SEM IMAGENS PENDENTES"
- ❌ NÃO escolha `image_analyzer` se já vê mensagens com 📸 no histórico

OBRIGATÓRIO APÓS ANÁLISE DE IMAGEM:
- ✅ Quando vê 📸 no histórico + STATUS = "SEM IMAGENS PENDENTES" → escolha `data_collector`
- ✅ Continue coletando: evolução, sintomas adicionais, alergias, medicações

Critérios para considerar dados suficientes:
- Sem onboarding: Pelo menos 5 turnos de conversa do paciente E sintomas identificados
- Com onboarding: Pelo menos 5 mensagens APÓS o onboarding E sintomas identificados
- Imagens foram analisadas (se houver)
- Perguntou sobre evolução dos sintomas, quando começou, intensidade

Agentes disponíveis:
- onboarding: Coleta condições crônicas, medicamentos e alergias (PRIORIDADE se pendente)
- image_analyzer: [DESABILITADO quando STATUS = "SEM IMAGENS PENDENTES"]
- data_collector: Coleta informações via texto (escolha padrão após imagem)
- summarizer: Cria resumo final
- finish: Encerra atendimento

Responda APENAS com um nome: onboarding, data_collector, summarizer ou finish."""


class SupervisorAgent:
    """Agente supervisor que coordena o fluxo de atendimento."""
    
    def __init__(self, model_id: Optional[str] = None, temperature: float = 0.3):
        """
        Inicializa o agente supervisor.
        
        Args:
            model_id: ID do modelo Bedrock (padrão: Claude 3.5 Sonnet)
            temperature: Temperatura para geração de respostas
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
        self.prompt = SUPERVISOR_PROMPT
    
    def route(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determina qual agente deve ser executado em seguida.
        
        Args:
            state: Estado atual do workflow
            
        Returns:
            Estado atualizado com o próximo agente
        """
        global call_count
        call_count += 1
        
        messages = state.get("messages", [])
        images = state.get("images", [])
        has_images = len(images) > 0
        
        logger.info(f"\n{'='*60}")
        logger.info(f"SUPERVISOR CALL #{call_count} - {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
        logger.info(f"Total de mensagens no estado: {len(messages)}")
        logger.info(f"Imagens pendentes para análise: {len(images)}")
        logger.info(f"{'='*60}")
        
        # 🚨 REGRA PRIORITÁRIA 1: Se precisa fazer onboarding
        patient_data = state.get("patient_data", {})
        has_onboarded = patient_data.get("has_onboarded", True)
        onboarding_complete = patient_data.get("onboarding_complete", False)
        
        # 🚨 REGRA PRIORITÁRIA 0: Se aguarda resposta de triagem de emergência
        awaiting_triage = state.get("awaiting_triage_response", False)
        if awaiting_triage and messages:
            last_msg = messages[-1]
            if last_msg.__class__.__name__ == "HumanMessage":
                logger.info(f"🚨 Interpretando resposta de triagem: '{last_msg.content}'")
                
                # Usa IA para interpretar resposta e gerar mensagem natural
                triage_interpretation_prompt = SystemMessage(content="""Você é um assistente de saúde em situação de emergência.

Analise a resposta do paciente à pergunta "Você consegue se mover com segurança?"

DETERMINE:
1. Se o paciente CONSEGUE ou NÃO CONSEGUE se mover com segurança
2. Crie uma mensagem URGENTE e CLARA:

Se NÃO CONSEGUE se mover:
- Informe para LIGAR 192 (SAMU) IMEDIATAMENTE
- Explique que ele receberá atendimento emergencial
- Dê orientações de segurança enquanto aguarda
- NÃO ofereça chamar ambulância (o paciente deve ligar)

Se CONSEGUE se mover:
- Informe para IR DIRETO ao hospital mais próximo
- Sugira opções de transporte (alguém levar, táxi/Uber)
- Alerte que se piorar no caminho, ligue 192
- NÃO ofereça chamar ambulância

Responda em JSON:
{
  "can_move": true ou false,
  "care_level": "EMERGENCY_SAMU" ou "EMERGENCY_HOSPITAL",
  "message": "mensagem natural e urgente para o paciente"
}

Seja DIRETO, URGENTE e empático.""")
                
                triage_context = HumanMessage(content=f"Resposta do paciente: '{last_msg.content}'\n\nAnalise e crie a mensagem:")
                
                try:
                    logger.info(f"⏳ Interpretando resposta de triagem com IA...")
                    triage_response = self.llm.invoke([triage_interpretation_prompt, triage_context])
                    response_text = _extract_text(triage_response).strip()
                    
                    # Extrai JSON
                    import json
                    import re
                    
                    # Tenta extrair JSON
                    try:
                        triage_data = json.loads(response_text)
                    except:
                        match = re.search(r'\{[\s\S]*\}', response_text)
                        if match:
                            triage_data = json.loads(match.group(0))
                        else:
                            raise ValueError("JSON não encontrado")
                    
                    care_level = triage_data.get("care_level", "EMERGENCY_HOSPITAL")
                    final_msg = triage_data.get("message", "Procure atendimento de emergência imediatamente.")
                    
                    logger.info(f"✅ Care level ajustado: {care_level}")
                    
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao interpretar triagem: {e}; usando fallback")
                    # Fallback simples
                    response_lower = last_msg.content.lower()
                    cannot_move = any(word in response_lower for word in ["não", "nao", "dificuldade", "mal"])
                    
                    if cannot_move:
                        care_level = "EMERGENCY_SAMU"
                        final_msg = "LIGUE 192 (SAMU) IMEDIATAMENTE! Fique em local seguro e mantenha-se calmo enquanto aguarda o atendimento."
                    else:
                        care_level = "EMERGENCY_HOSPITAL"
                        final_msg = "VÁ DIRETO ao hospital mais próximo! Peça ajuda para transporte. Se piorar, ligue 192."
                
                medical_summary = state.get("medical_summary", {})
                medical_summary["care_level"] = care_level
                state["medical_summary"] = medical_summary
                state["awaiting_triage_response"] = False
                state["is_complete"] = True
                ai_msg = AIMessage(content=final_msg)
                ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                state["messages"] = state.get("messages", []) + [ai_msg]
                state["next"] = "finish"
                return state
        
        # Se has_onboarded=False e ainda não completou, vai para onboarding
        if not has_onboarded and not onboarding_complete:
            # Só vai para onboarding após algumas mensagens (não na primeira)
            if len(messages) >= 2:
                logger.info(f"📋 FORÇANDO rota para onboarding (has_onboarded=False)")
                state["next"] = "onboarding"
                return state
        
        # Se onboarding acabou de completar, força data_collector para continuar triagem
        if onboarding_complete and not patient_data.get("onboarding_processed"):
            logger.info(f"✅ Onboarding completo, FORÇANDO data_collector para continuar triagem")
            patient_data["onboarding_processed"] = True
            state["patient_data"] = patient_data
            state["next"] = "data_collector"
            logger.info(f"📊 Flag onboarding_processed setada: {patient_data.get('onboarding_processed')}")
            return state
        
        # 🚨 REGRA PRIORITÁRIA 2: Se há imagens, vai direto para image_analyzer
        if has_images:
            logger.info(f"🖼️ FORÇANDO rota para image_analyzer (há {len(images)} imagem(ns) pendente(s))")
            state["next"] = "image_analyzer"
            return state
        
        # Cria mensagem para o supervisor com informação sobre imagens e onboarding
        image_status = "SEM IMAGENS PENDENTES" if not has_images else f"{len(images)} IMAGEM(NS) PENDENTE(S)"
        onboarding_status = "PENDENTE" if (not has_onboarded and not onboarding_complete) else "COMPLETO"
        context = f"STATUS DE ONBOARDING: {onboarding_status}\nSTATUS DE IMAGENS: {image_status}\n\nBaseado na conversa abaixo, qual agente deve ser chamado?\n\n{self._format_messages(messages)}"
        
        supervisor_messages = [
            SystemMessage(content=self.prompt),
            HumanMessage(content=context)
        ]
        
        # Obtém decisão do supervisor
        logger.info(f"⏳ Chamando Bedrock (Supervisor)...")
        response = self.llm.invoke(supervisor_messages)
        logger.info(f"✅ Resposta recebida do Bedrock")
        # Normalize different response shapes (string, message-like object, dict, or list)
        def _extract_text(resp):
            if isinstance(resp, str):
                return resp
            if isinstance(resp, dict):
                # common keys: 'content', 'text'
                for k in ("content", "text"):
                    if k in resp and isinstance(resp[k], str):
                        return resp[k]
                return str(resp)
            if isinstance(resp, list):
                parts = []
                for item in resp:
                    if isinstance(item, str):
                        parts.append(item)
                    elif isinstance(item, dict):
                        for k in ("content", "text"):
                            if k in item and isinstance(item[k], str):
                                parts.append(item[k])
                                break
                        else:
                            parts.append(str(item))
                    else:
                        # message-like object with .content
                        content = getattr(item, "content", None)
                        if isinstance(content, str):
                            parts.append(content)
                        else:
                            parts.append(str(item))
                return "\n".join(parts)
            # message-like object with .content attribute
            content = getattr(resp, "content", None)
            if isinstance(content, str):
                return content
            return str(resp)

        text = _extract_text(response).strip().lower()
        # Detect valid agent name in the response text
        valid_agents = ["onboarding", "image_analyzer", "data_collector", "summarizer", "finish"]
        next_agent = None
        for agent in valid_agents:
            if agent in text:
                next_agent = agent
                break
        if next_agent is None:
            # fallback to first token if it exactly matches one of the agents
            token = text.split()[0] if text else ""
            next_agent = token if token in valid_agents else "data_collector"

        # Conta mensagens humanas para verificar critérios
        human_msgs = [m for m in messages if m.__class__.__name__ == "HumanMessage"]
        symptoms = patient_data.get("symptoms", [])
        
        # Conta quantas mensagens são DEPOIS do onboarding (para triagem real)
        onboarding_processed = patient_data.get("onboarding_processed", False)
        logger.info(f"🔍 onboarding_processed={onboarding_processed}, onboarding_complete={onboarding_complete}")
        human_msgs_after_onboarding = 0
        if onboarding_processed:
            found_transition = False
            for msg in messages:
                if msg.__class__.__name__ == "AIMessage":
                    content_lower = msg.content.lower()
                    if any(p in content_lower for p in ["obrigado pelas informações", "obrigado por fornecer", "poderia me contar se está sentindo"]):
                        found_transition = True
                        logger.info(f"🔄 Transição: '{msg.content[:60]}...'")
                        continue
                if found_transition and msg.__class__.__name__ == "HumanMessage":
                    human_msgs_after_onboarding += 1
            logger.info(f"📊 Msgs após onboarding: {human_msgs_after_onboarding}")
        
        # Verifica se há análise de imagem recente (mensagem com 📸)
        has_recent_image_analysis = False
        if messages:
            last_ai_msgs = [m for m in messages if m.__class__.__name__ == "AIMessage"]
            if last_ai_msgs:
                last_ai_content = str(last_ai_msgs[-1].content)
                has_recent_image_analysis = "📸" in last_ai_content
        
        # Critérios para pedir confirmação:
        # Se teve onboarding: precisa de pelo menos 5 mensagens DEPOIS do onboarding
        # Se não teve onboarding: precisa de pelo menos 5 mensagens no total
        if onboarding_processed:
            has_enough_interaction = human_msgs_after_onboarding >= 5 and symptoms
            logger.info(f"📊 Onboarding processado: {human_msgs_after_onboarding} msgs após onboarding, sintomas: {len(symptoms)}")
        else:
            has_enough_interaction = (len(human_msgs) >= 5 and symptoms) or (len(human_msgs) >= 6)
            logger.info(f"📊 Sem onboarding: {len(human_msgs)} msgs totais, sintomas: {len(symptoms)}")
        
        # NÃO pede confirmação se acabou de analisar imagem
        has_enough_interaction = has_enough_interaction and not has_recent_image_analysis
        
        # Verifica se já pedimos confirmação (última mensagem AI contém pergunta)
        already_asked_confirmation = False
        if messages:
            last_ai_msgs = [m for m in messages if m.__class__.__name__ == "AIMessage"]
            if last_ai_msgs:
                last_ai_content = str(last_ai_msgs[-1].content).lower()
                already_asked_confirmation = "mais alguma" in last_ai_content or "algo mais" in last_ai_content or "mais algum" in last_ai_content
        
        # PRIORIDADE 1: Se atingiu critérios mas ainda NÃO perguntou, pergunta agora (sobrescreve decisão do supervisor)
        # IMPORTANTE: Só pergunta confirmação para casos que vão para consulta presencial (IN_PERSON)
        # Para TELEMEDICINE, vai direto para summarizer
        if has_enough_interaction and not already_asked_confirmation:
            logger.info(f"ℹ️ Critérios atingidos (msgs: {len(human_msgs)}, sintomas: {len(symptoms)}); verificando se precisa confirmação")
            
            # Usa IA para prever care_level antes de decidir se pergunta
            care_level_prediction_prompt = SystemMessage(content="""Analise os sintomas relatados e classifique o nível de cuidado necessário:

- EMERGENCY: Risco de vida ou emergência grave (dor no peito intensa, falta de ar severa, perda de consciência, convulsões, sangramento grave, AVC, anafilaxia, trauma grave)
- TELEMEDICINE: Sintomas agudos mas não emergenciais que podem ser resolvidos remotamente (resfriado, gripe, dor de garganta leve, febre baixa <38.5°C, náusea leve, tosse, coriza, erupções cutâneas leves)
- IN_PERSON: Necessita exame físico ou investigação presencial (dor persistente, sintomas que não melhoram, necessidade de exames laboratoriais ou de imagem, check-up, procedimentos)

Responda APENAS com: EMERGENCY, TELEMEDICINE ou IN_PERSON""")
            
            care_level_context = HumanMessage(content=f"Sintomas relatados:\n{self._format_messages(messages)}\n\nClassifique o nível de cuidado:")
            
            try:
                logger.info(f"⏳ Prevendo care_level para decidir se pergunta confirmação...")
                care_level_response = self.llm.invoke([care_level_prediction_prompt, care_level_context])
                predicted_care_level = _extract_text(care_level_response).strip().upper()
                logger.info(f"✅ Care level previsto: {predicted_care_level}")
                
                # Se for TELEMEDICINE ou IN_PERSON, pergunta confirmação antes de finalizar
                if "TELEMEDICINE" in predicted_care_level or "IN_PERSON" in predicted_care_level:
                    logger.info(f"ℹ️ {predicted_care_level} detectado - gerando pergunta final para coletar sintomas adicionais")
                    
                    # Gera pergunta de confirmação natural usando o LLM
                    confirmation_prompt = SystemMessage(content="""Você é um assistente de saúde empático e natural.
Baseado na conversa até agora, crie UMA ÚNICA pergunta curta e amigável perguntando ao paciente se ele tem mais algum sintoma ou informação importante para compartilhar antes de finalizar.

Seja breve (1-2 frases) e natural.
Varie as formas de perguntar - evite começar sempre com 'Entendi'. Use expressões variadas como 'Certo', 'Perfeito', 'Beleza', 'Ok' ou vá direto à pergunta.
Não repita informações já ditas, apenas pergunte se há "mais algum sintoma" ou "algo a acrescentar" de forma natural e casual.""")
                    
                    confirmation_context = HumanMessage(content=f"Últimas mensagens:\n{self._format_messages(messages)}\n\nCrie a pergunta de confirmação:")
                    
                    try:
                        logger.info(f"⏳ Gerando pergunta de confirmação natural...")
                        # Adiciona nome do paciente ao contexto se disponível (usa primeiro nome para chat)
                        patient_data_dict = state.get("patient_data", {})
                        patient_name = patient_data_dict.get("first_name") or patient_data_dict.get("name")
                        if patient_name:
                            confirmation_context.content += f"\n\nNome do paciente: {patient_name}. Use o nome naturalmente na pergunta."
                        
                        confirmation_response = self.llm.invoke([confirmation_prompt, confirmation_context])
                        confirmation_msg = _extract_text(confirmation_response).strip()
                        confirmation_msg = remove_emojis(confirmation_msg)
                        logger.info(f"✅ Pergunta gerada: '{confirmation_msg[:50]}...'")
                    except Exception as e:
                        logger.warning(f"⚠️ Erro ao gerar pergunta: {e}; usando fallback")
                        confirmation_msg = "Tem mais algum sintoma ou informação que você gostaria de acrescentar antes de finalizarmos?"
                    
                    # Adiciona a pergunta às mensagens e TERMINA o turno (aguarda resposta do usuário)
                    ai_msg = AIMessage(content=confirmation_msg)
                    ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                    state["messages"].append(ai_msg)
                    state["next"] = "finish"
                    return state
                
                # Se for EMERGENCY, faz triagem SAMU vs Hospital ANTES de ir para summarizer
                if "EMERGENCY" in predicted_care_level:
                    logger.info(f"🚨 EMERGENCY detectado - verificando se já foi instruído")
                    
                    # Verifica se já foi dada instrução de emergência (ligar 192, ir ao hospital, etc)
                    already_instructed_emergency = False
                    already_asked_mobility = False
                    
                    if messages:
                        # Busca nas últimas 5 mensagens AI
                        last_ai_msgs = [m for m in messages[-5:] if m.__class__.__name__ == "AIMessage"]
                        for ai_msg in last_ai_msgs:
                            msg_content = str(ai_msg.content).lower()
                            
                            # Verifica se já instruiu a ligar 192 ou ir ao hospital
                            emergency_phrases = [
                                "ligue 192", "ligar 192", "ligue para 192", "ligar para 192",
                                "ligue imediatamente", "serviço de emergência",
                                "vá ao hospital", "vá direto ao hospital",
                                "procure atendimento de emergência",
                                "pronto-socorro", "pronto socorro"
                            ]
                            
                            if any(phrase in msg_content for phrase in emergency_phrases):
                                already_instructed_emergency = True
                                logger.info(f"ℹ️ Já foi dada instrução de emergência: '{msg_content[:60]}...'")
                                break
                            
                            # Verifica se já perguntou sobre mobilidade
                            if ("consegue se mover" in msg_content or "respirando normalmente" in msg_content):
                                already_asked_mobility = True
                                logger.info(f"ℹ️ Já foi feita pergunta de mobilidade anteriormente")
                    
                    # Se já foi instruído sobre emergência, apenas finaliza com apoio (não pergunta novamente)
                    if already_instructed_emergency:
                        logger.info(f"✅ Paciente já foi instruído sobre emergência, finalizando com mensagem de apoio")
                        support_msg = "Fique calmo e siga as orientações. Você está fazendo a coisa certa. Cuide-se!"
                        ai_msg = AIMessage(content=support_msg)
                        ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                        state["messages"].append(ai_msg)
                        state["is_complete"] = True
                        
                        # Define care_level como EMERGENCY_SAMU por padrão (já foi instruído a ligar)
                        medical_summary = state.get("medical_summary", {})
                        medical_summary["care_level"] = "EMERGENCY_SAMU"
                        state["medical_summary"] = medical_summary
                        
                        state["next"] = "summarizer"
                        return state
                    
                    # Se já perguntou sobre mobilidade, vai direto para o summarizer (paciente já respondeu)
                    if already_asked_mobility:
                        logger.info(f"✅ Pulando pergunta de mobilidade (já foi feita), indo para summarizer")
                        next_agent = "summarizer"
                        return {"next": next_agent}
                    
                    # Pergunta sobre mobilidade para decidir SAMU vs Hospital
                    mobility_prompt = SystemMessage(content="""Você é um assistente de emergência médica.
O paciente está em situação de EMERGÊNCIA. Você precisa determinar se ele deve:
- Ligar para o SAMU (192) - se NÃO consegue se mover com segurança
- Ir direto ao hospital - se CONSEGUE se mover com segurança

Crie UMA pergunta DIRETA e URGENTE perguntando:
"Você consegue se mover com segurança?"

Seja BREVE (1 frase) e DIRETO.""")
                    
                    try:
                        logger.info(f"⏳ Gerando pergunta de triagem de mobilidade...")
                        mobility_response = self.llm.invoke([mobility_prompt, HumanMessage(content="Crie a pergunta de triagem:")])
                        mobility_msg = _extract_text(mobility_response).strip()
                        mobility_msg = remove_emojis(mobility_msg)
                        logger.info(f"✅ Pergunta gerada: '{mobility_msg[:50]}...'")
                    except Exception as e:
                        logger.warning(f"⚠️ Erro ao gerar pergunta: {e}; usando fallback")
                        mobility_msg = "Você consegue se mover com segurança? Está respirando normalmente?"
                    
                    # Adiciona pergunta e marca que aguarda resposta de triagem
                    ai_msg = AIMessage(content=mobility_msg)
                    ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                    state["messages"].append(ai_msg)
                    state["awaiting_triage_response"] = True
                    state["next"] = "finish"
                    return state
                    
            except Exception as e:
                logger.warning(f"⚠️ Erro ao prever care_level: {e}; usando comportamento padrão (pergunta confirmação)")
                # Fallback: pergunta confirmação
                confirmation_msg = "Tem mais alguma coisa que você gostaria de me contar sobre como está se sentindo?"
                ai_msg = AIMessage(content=confirmation_msg)
                ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                state["messages"].append(ai_msg)
                state["next"] = "finish"
                return state
        
        # PRIORIDADE 2: Se já perguntou e usuário respondeu, interpreta a resposta
        if already_asked_confirmation and len(human_msgs) > 0:
            last_human_msg = messages[-1] if messages[-1].__class__.__name__ == "HumanMessage" else None
            
            if last_human_msg:
                # Usa LLM para interpretar se o usuário quer continuar ou finalizar
                interpretation_prompt = SystemMessage(content="""Analise a resposta do usuário e determine se ele:
A) Quer adicionar MAIS informações (tem algo a complementar)
B) NÃO tem mais nada a adicionar (está satisfeito/pronto para finalizar)

Responda APENAS com 'CONTINUAR' ou 'FINALIZAR'.""")
                
                interpretation_msg = HumanMessage(content=f"Pergunta feita: 'Tem mais alguma informação?'\nResposta do usuário: '{last_human_msg.content}'")
                
                try:
                    interpretation_response = self.llm.invoke([interpretation_prompt, interpretation_msg])
                    interpretation_text = _extract_text(interpretation_response)
                    interpretation_text = interpretation_text.strip().upper()
                    
                    if "FINALIZAR" in interpretation_text:
                        logger.info(f"ℹ️ LLM interpretou resposta como finalização: '{last_human_msg.content}'; FORÇANDO summarizer")
                        # Gera mensagem de despedida antes de chamar summarizer
                        farewell_prompt = SystemMessage(content="""Você é um assistente de saúde empático. O paciente indicou que não tem mais informações a acrescentar.
Crie UMA ÚNICA mensagem curta (2-3 frases) agradecendo e informando que os dados serão enviados ao médico.
Seja caloroso e deseje melhoras.""")
                        
                        try:
                            # Adiciona nome do paciente ao contexto se disponível (usa primeiro nome para chat)
                            patient_data_dict = state.get("patient_data", {})
                            patient_name = patient_data_dict.get("first_name") or patient_data_dict.get("name")
                            farewell_context = f"Conversa:\n{self._format_messages(messages)}"
                            if patient_name:
                                farewell_context += f"\n\nNome do paciente: {patient_name}. Use o nome naturalmente na despedida."
                            
                            farewell_response = self.llm.invoke([farewell_prompt, HumanMessage(content=farewell_context)])
                            farewell_msg = _extract_text(farewell_response).strip()
                            farewell_msg = remove_emojis(farewell_msg)
                        except:
                            farewell_msg = "Obrigado por compartilhar essas informações! Vou enviar tudo para o médico avaliar. Cuide-se!"
                        
                        # Adiciona mensagem de despedida e marca para summarizer
                        ai_msg = AIMessage(content=farewell_msg)
                        ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                        state["messages"] = state.get("messages", []) + [ai_msg]
                        next_agent = "summarizer"
                    else:
                        logger.info(f"ℹ️ LLM interpretou resposta como continuação: '{last_human_msg.content}'; mantendo data_collector")
                        next_agent = "data_collector"
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao interpretar resposta do usuário: {e}; usando heurística básica")
                    # Fallback para heurística básica
                    last_human_content = str(last_human_msg.content).lower()
                    no_more = any(word in last_human_content for word in ["não", "nao", "ok", "só isso", "so isso", "é tudo", "e tudo", "pronto", "nada"])
                    if no_more:
                        # Mensagem de despedida fallback
                        farewell_msg = "Obrigado por compartilhar essas informações! Vou enviar tudo para o médico avaliar. Cuide-se!"
                        ai_msg = AIMessage(content=farewell_msg)
                        ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                        state["messages"] = state.get("messages", []) + [ai_msg]
                        next_agent = "summarizer"
                    else:
                        next_agent = "data_collector"

        # Se o modelo produziu algo inesperado, padroniza
        if next_agent not in valid_agents:
            logger.warning(f"⚠️ Resposta inesperada '{next_agent}', usando data_collector")
            next_agent = "data_collector"

        return {"next": next_agent}
    
    def _format_messages(self, messages: list) -> str:
        """Formata mensagens para apresentação ao supervisor."""
        formatted = []
        for msg in messages:
            role = msg.__class__.__name__
            content = msg.content
            formatted.append(f"{role}: {content}")
        return "\n".join(formatted[-5:])  # Últimas 5 mensagens
