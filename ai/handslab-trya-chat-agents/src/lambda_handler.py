"""
Lambda Handler para o agente de triagem de saúde.
"""
import os
import json
import sys
import logging
from decimal import Decimal
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configurar logging para Lambda
from src.utils.logging_config import setup_lambda_logging
setup_lambda_logging()
logger = logging.getLogger(__name__)



from src.graph.workflow import compile_workflow
from src.models.state import State
from src.storage import get_storage
from src.services.transcription import TranscriptionService
from src.services.trya_integration import TryaIntegrationService
from src.services.onboarding import OnboardingService


# Compila o workflow uma vez (cold start)
app = None

# Storage de sessões (inicializado sob demanda) - USA FACTORY AGORA
storage = None

# Serviço de transcrição (inicializado sob demanda)
transcription_service = None

# Serviço de integração Trya (inicializado sob demanda)
trya_service = None

# Serviço de onboarding (inicializado sob demanda)
onboarding_service = None

# Contador de chamadas para debug
call_counter = {'bedrock_calls': 0, 'supervisor_calls': 0, 'data_collector_calls': 0}


class DecimalEncoder(json.JSONEncoder):
    """Encoder customizado para serializar Decimal do DynamoDB."""
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Converte para int se não tiver parte decimal, senão para float
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


def _extract_first_name(full_name: str) -> str:
    """
    Extrai o primeiro nome de um nome completo.
    
    Args:
        full_name: Nome completo (ex: "Ana Beneficiária Trigo")
        
    Returns:
        Primeiro nome (ex: "Ana")
    """
    if not full_name:
        return ""
    return full_name.split()[0].strip()


def get_workflow():
    """Obtém ou cria a instância do workflow."""
    global app
    if app is None:
        app = compile_workflow()
    return app


def get_storage():
    """Obtém ou cria a instância do storage (usa factory para detectar backend)."""
    global storage
    if storage is None:
        from src.storage import get_storage as create_storage
        storage = create_storage()
    return storage


def get_transcription_service():
    """Obtém ou cria a instância do serviço de transcrição."""
    global transcription_service
    if transcription_service is None:
        s3_bucket = os.getenv("BUCKET_NAME")
        transcription_service = TranscriptionService(s3_bucket=s3_bucket)
    return transcription_service


def get_trya_service():
    """Obtém ou cria a instância do serviço Trya."""
    global trya_service
    if trya_service is None:
        trya_service = TryaIntegrationService()
    return trya_service


def get_onboarding_service():
    """Obtém ou cria a instância do serviço de onboarding."""
    global onboarding_service
    if onboarding_service is None:
        onboarding_service = OnboardingService()
    return onboarding_service


def _process_images(images: list) -> list:
    """
    Processa lista de imagens para formato Claude Vision.
    
    Args:
        images: Lista de imagens. Pode ser:
               - Base64: [{"data": "base64...", "media_type": "image/jpeg", "filename": "foto.jpg"}]
               - URL: [{"url": "https://...", "filename": "foto.jpg"}]
               - Formato já processado do Claude
    
    Returns:
        Lista formatada para Claude Vision API (com original_name preservado)
    """
    processed_images = []
    
    for img in images:
        # Se já está no formato correto do Claude
        if "type" in img and img["type"] == "image":
            processed_images.append(img)
            continue
        
        # Preserva nome original do arquivo
        original_name = img.get("filename") or img.get("original_name")
        
        # Se é base64
        if "data" in img:
            processed_img = {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": img.get("media_type", "image/jpeg"),
                    "data": img["data"]
                }
            }
            if original_name:
                processed_img["original_name"] = original_name
            processed_images.append(processed_img)
        # Se é URL
        elif "url" in img:
            processed_img = {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": img["url"]
                }
            }
            if original_name:
                processed_img["original_name"] = original_name
            processed_images.append(processed_img)
    
    return processed_images


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler principal da Lambda.
    
    Suporta dois modos de invocação:
    1. Via API Gateway: event com "body" contendo JSON
    2. Invocação direta: event já é o payload JSON
    
    Args:
        event: Evento Lambda contendo a mensagem do usuário
        context: Contexto da Lambda
        
    Returns:
        Resposta HTTP com a mensagem do agente
    """
    try:
        # Detecta tipo de invocação (API Gateway vs direta)
        if "body" in event:
            # Invocação via API Gateway
            body = json.loads(event.get("body", "{}"))
        else:
            # Invocação direta (NestJS, AWS SDK, etc)
            body = event
        
        user_message = body.get("message", "")
        session_id = body.get("session_id", "default")
        user_id = body.get("user_id")
        user_name = body.get("name")  # Nome do beneficiário (primeira conversa)
        tenant_id = body.get("tenant_id")  # ID do tenant
        onboard_data = body.get("onboard_data")  # Dados de onboarding
        has_onboarded = body.get("has_onboarded", True)  # Se false, precisa fazer onboarding
        
        # Suporte para áudio
        audio_data = body.get("audio")
        audio_format = body.get("audio_format", "mp3")
        transcribed_text = None  # Armazena o texto transcrito para retornar na resposta
        
        # Suporte para imagens
        images = body.get("images", [])  # Lista de imagens
        image_context = body.get("image_context", "")  # Contexto sobre as imagens
        
        # Se áudio foi fornecido, transcreve para texto
        if audio_data:
            logger.info(f"🎙️ Áudio recebido (formato: {audio_format}), iniciando transcrição...")
            try:
                transcription_svc = get_transcription_service()
                transcribed_text = transcription_svc.transcribe_audio(audio_data, audio_format)
                user_message = transcribed_text
                logger.info(f"✅ Transcrição concluída: '{user_message[:100]}...'")
            except Exception as e:
                logger.error(f"❌ Erro na transcrição: {e}")
                return {
                    "statusCode": 500,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({
                        "error": f"Erro ao transcrever áudio: {str(e)}"
                    }, cls=DecimalEncoder)
                }
        
        # Valida se tem mensagem OU imagens
        if not user_message and not images:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "Message, audio or images are required"
                }, cls=DecimalEncoder)
            }
        
        # Se apenas imagens foram enviadas (sem texto), cria uma mensagem automática
        if not user_message and images:
            if image_context:
                user_message = f"[Imagem enviada] {image_context}"
            else:
                user_message = "[Imagem enviada para análise]"
            logger.info(f"📝 Mensagem automática criada: '{user_message}'")
        # Carrega ou cria sessão (usa storage plugável)
        logger.info(f"🔌 Inicializando storage...")
        session_storage = get_storage()
        logger.info(f"✅ Storage inicializado: {type(session_storage).__name__}")
        
        logger.info(f"📂 Carregando sessão {session_id}...")
        existing_state = session_storage.load_session(session_id)
        logger.info(f"✅ Sessão carregada: {existing_state is not None}")

        # Bloqueia novas mensagens em sessões já encerradas
        if existing_state and existing_state.get("is_complete") and (user_message or images):
            logger.warning(f"🚫 Sessão {session_id} já encerrada. Nova mensagem rejeitada.")
            return {
                "statusCode": 400,
                "is_complete": True,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "A sessão já foi encerrada. Inicie um novo chat para continuar."
                }, cls=DecimalEncoder)
            }
        
        if existing_state:
            # Sessão existente - adiciona nova mensagem do usuário
            logger.info(f"📂 Carregando sessão existente: {session_id}")
            if user_message:
                # Cria mensagem com timestamp ANTES de adicionar ao estado
                msg = HumanMessage(content=user_message)
                msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                existing_state["messages"].append(msg)
                logger.info(f"⏱️ HumanMessage criada com timestamp: {msg.additional_kwargs['timestamp']}")
            
            # Adiciona imagens se fornecidas
            if images:
                existing_state["images"] = _process_images(images)
                existing_state["image_context"] = image_context
                logger.info(f"🖼️ {len(images)} imagem(ns) adicionada(s) à sessão")
            
            # Atualiza onboard_data se fornecido (pode vir em mensagens subsequentes)
            if onboard_data:
                existing_patient_data = existing_state.get("patient_data", {})
                existing_patient_data["onboard_data"] = onboard_data
                existing_state["patient_data"] = existing_patient_data
                logger.info(f"📋 Dados de onboarding atualizados na sessão existente")
            
            # Atualiza has_onboarded
            existing_patient_data = existing_state.get("patient_data", {})
            existing_patient_data["has_onboarded"] = has_onboarded
            existing_state["patient_data"] = existing_patient_data
            
            current_state: State = existing_state  # type: ignore
        else:
            # Nova sessão
            logger.info(f"🆕 Criando nova sessão: {session_id}")
            patient_data = {}
            if user_name:
                # Mantém nome completo para registros, mas armazena primeiro nome para chat
                patient_data["name"] = user_name
                first_name = _extract_first_name(user_name)
                patient_data["first_name"] = first_name
                logger.info(f"👤 Nome completo: {user_name}")
                logger.info(f"👤 Primeiro nome (para chat): {first_name}")
            if onboard_data:
                patient_data["onboard_data"] = onboard_data
                logger.info(f"📋 Dados de onboarding recebidos")
            patient_data["has_onboarded"] = has_onboarded
            
            # Cria mensagem inicial com timestamp ANTES de adicionar ao estado
            initial_messages = []
            if user_message:
                msg = HumanMessage(content=user_message)
                msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
                initial_messages.append(msg)
                logger.info(f"⏱️ HumanMessage inicial criada com timestamp: {msg.additional_kwargs['timestamp']}")
            
            current_state: State = {
                "messages": initial_messages,
                "next": "supervisor",
                "patient_data": patient_data,
                "images": _process_images(images) if images else [],
                "image_context": image_context,
                "is_complete": False,
                "medical_summary": None
            }
            
            if images:
                logger.info(f"🖼️ {len(images)} imagem(ns) adicionada(s) à nova sessão")
        
        # Conta mensagens antes da execução (para pegar apenas as novas)
        messages_before = len(current_state.get("messages", []))
        
        # Obtém workflow
        logger.info(f"🔧 Obtendo workflow...")
        workflow = get_workflow()
        logger.info(f"✅ Workflow obtido")
        
        # Executa workflow
        logger.info(f"🚀 Executando workflow...")
        result = workflow.invoke(current_state)
        logger.info(f"✅ Workflow executado com sucesso")
        
        # Salva estado atualizado da sessão (usando storage plugável)
        # Enriquecimento: se existir medical_summary, garantir espelhamento também dentro de result['patient_data']
        if result.get("medical_summary"):
            ms = result["medical_summary"]
            pd = result.get("patient_data", {}) or {}
            pd.setdefault("symptoms", pd.get("symptoms", []))
            pd.update({
                "medical_summary": ms,
                "conversation_summary": ms.get("conversation_summary", ""),
                "main_symptoms": ms.get("main_symptoms", []),
                "chief_complaint": ms.get("chief_complaint", ""),
                "suggested_exams": ms.get("suggested_exams", []),
                "urgency_level": ms.get("urgency_level", ""),
                "care_recommendation": ms.get("care_recommendation", ""),
                "basic_care_instructions": ms.get("basic_care_instructions", [])
            })
            result["patient_data"] = pd
        
        # Envia dados de onboarding se completo
        patient_data = result.get("patient_data", {})
        onboarding_data = patient_data.get("onboarding_data", {})
        
        if patient_data.get("onboarding_complete") and not patient_data.get("onboarding_sent"):
            try:
                onboarding_svc = get_onboarding_service()
                success = onboarding_svc.send_onboarding_data(
                    user_id=user_id,
                    chronic_conditions=onboarding_data.get("chronic_conditions", []),
                    medications=onboarding_data.get("medications", []),
                    allergies=onboarding_data.get("allergies", "")
                )
                if success:
                    patient_data["onboarding_sent"] = True
                    patient_data["has_onboarded"] = True
                    result["patient_data"] = patient_data
                    logger.info("✅ Dados de onboarding enviados para API do tenant")
            except Exception as e:
                logger.error(f"❌ Erro ao enviar onboarding: {str(e)}")
        
        # Se o atendimento está completo, adiciona mensagem de encerramento como AIMessage ANTES de salvar
        if result.get("is_complete"):
            closing_message = (
                "Sempre que surgir um novo sintoma, se precisar de orientações rápidas ou quiser atualizar "
                "seus dados de saúde (como o monitoramento da sua pressão ou glicemia), basta iniciar um novo chat. "
                "Estamos disponíveis 24 horas por dia para garantir que você receba o suporte necessário de forma ágil e segura.\n\n"
                "Lembre-se: a Trya estará sempre aqui quando você precisar.\n"
                "Cuide-se, siga as orientações médicas e fique bem!"
            )
            from langchain_core.messages import AIMessage
            closing_ai_msg = AIMessage(content=closing_message)
            closing_ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
            result["messages"].append(closing_ai_msg)
            logger.info(f"✅ Mensagem de encerramento adicionada como AIMessage (atendimento completo)")
        
        # Determina etapa do atendimento ANTES de salvar no DynamoDB
        # Prioriza etapa identificada pela IA (se disponível nos additional_kwargs)
        all_messages = result.get("messages", [])
        identified_stage = None
        for msg in reversed(all_messages):
            if hasattr(msg, '__class__') and msg.__class__.__name__ == 'AIMessage':
                if hasattr(msg, 'additional_kwargs') and msg.additional_kwargs.get("identified_stage"):
                    identified_stage = msg.additional_kwargs.get("identified_stage")
                    break
        
        if identified_stage:
            current_stage = identified_stage
            logger.info(f"🎯 Usando etapa identificada pela IA: {current_stage}")
        else:
            current_stage = _determine_stage(result, all_messages)
            logger.info(f"📊 Usando etapa calculada: {current_stage}")
        
        # Adiciona current_stage ao result PARA SER SALVO NO DYNAMODB
        result["current_stage"] = current_stage
        logger.info(f"✅ current_stage adicionado ao estado: '{current_stage}'")
        
        # HybridStorage salva no DynamoDB automaticamente quando is_complete=True
        session_storage.save_session(session_id, result, user_id=user_id, tenant_id=tenant_id)
        
        # Envia para Trya SOMENTE se for consulta eletiva (IN_PERSON - Nível 3)
        # Motivo: paciente terá tempo para fazer exames antes da consulta
        # Não envia TELEMEDICINE (Nível 2) nem EMERGENCY (Nível 1)
        if result.get("is_complete"):
            medical_summary = result.get("medical_summary", {}) or {}
            care_level = medical_summary.get("care_level", "")
            
            logger.info(f"🔍 Verificando envio para Trya: care_level='{care_level}', is_complete={result.get('is_complete')}")
            
            # Apenas IN_PERSON (Nível 3 - Rede Credenciada) vai para fila Trya
            if care_level and care_level == "IN_PERSON":
                try:
                    import time
                    trya_start = time.time()
                    
                    trya_svc = get_trya_service()
                    patient_data = result.get("patient_data", {})
                    
                    logger.info("📤 Consulta eletiva detectada, enviando para fila Trya...")
                    success = trya_svc.send_triage_data(
                        session_id=session_id,
                        patient_data=patient_data,
                        patient_name=patient_data.get("name"),
                        user_id=user_id,
                        tenant_id=tenant_id,
                        updated_at=datetime.now().isoformat()
                    )
                    
                    trya_elapsed = time.time() - trya_start
                    if success:
                        logger.info(f"✅ Enviado para Trya em {trya_elapsed:.2f}s")
                    else:
                        logger.warning(f"⚠️ Falha ao enviar para Trya após {trya_elapsed:.2f}s (dados salvos no DynamoDB)")
                        
                except Exception as e:
                    logger.error(f"❌ ERRO ao enviar para Trya: {str(e)}")
                    logger.info("ℹ️ Dados estão salvos no DynamoDB e podem ser reenviados manualmente")
            else:
                logger.info(f"ℹ️ Care level '{care_level}' não é IN_PERSON (Nível 3 - Rede Credenciada)")
                logger.info(f"🚫 NÃO enviando para Trya (apenas consultas eletivas presenciais são enviadas)")
            
            # Salva dados de saúde coletados no perfil do usuário (se houver)
            #if user_id and medical_summary:
            #    collected_allergies = medical_summary.get("collected_allergies", "")
            #    collected_medications = medical_summary.get("collected_medications", [])
            #    collected_conditions = medical_summary.get("collected_chronic_conditions", [])
                
            #    if collected_allergies or collected_medications or collected_conditions:
            #        try:
            #            trya_svc = get_trya_service()
            #            logger.info(f"📋 Salvando dados de saúde coletados para usuário {user_id}")
            #            trya_svc.save_collected_health_data(
            #                user_id=user_id,
            #                allergies=collected_allergies,
            #                medications=collected_medications,
            #                chronic_conditions=collected_conditions
            #            )
            #        except Exception as e:
            #            logger.error(f"⚠️ Erro ao salvar dados de saúde: {str(e)}")
        
        # Extrai APENAS as mensagens novas geradas nesta execução
        new_messages = all_messages[messages_before:]  # Pega apenas as adicionadas após a execução
        
        logger.info(f"📊 Mensagens antes: {messages_before}, Total agora: {len(all_messages)}, Novas: {len(new_messages)}")
        
        # Filtra apenas AIMessages novas com conteúdo
        new_ai_messages = [
            msg for msg in new_messages 
            if hasattr(msg, '__class__') and msg.__class__.__name__ == 'AIMessage' 
            and msg.content and msg.content.strip()
        ]
        
        logger.info(f"📝 Mensagens AI novas: {len(new_ai_messages)}")
        
        if new_ai_messages:
            # Se houver mais de uma mensagem AI nova, concatena; caso contrário usa a única disponível
            if len(new_ai_messages) > 1:
                last_message = "\n\n".join(msg.content.strip() for msg in new_ai_messages)
            else:
                last_message = new_ai_messages[-1].content.strip()
            logger.info(f"✅ Resposta extraída: '{last_message[:1000]}...'")
        else:
            # Fallback: pega a última mensagem AI de todas as mensagens
            logger.warning(f"⚠️ Nenhuma mensagem AI nova encontrada, usando fallback")
            all_ai_messages = [
                msg for msg in all_messages 
                if hasattr(msg, '__class__') and msg.__class__.__name__ == 'AIMessage' 
                and msg.content and msg.content.strip()
            ]
            if all_ai_messages:
                last_message = all_ai_messages[-1].content.strip()
                logger.info(f"✅ Usando última mensagem AI: '{last_message[:100]}...'")
            else:
                last_message = "Desculpe, não consegui processar sua solicitação."
                logger.error(f"❌ Nenhuma mensagem AI encontrada no resultado!")
        
        # Retorna resposta
        response_body = {
            "message": last_message,
            "messages": [msg.content.strip() for msg in new_ai_messages] if new_ai_messages else [last_message],  # Array com todas as mensagens (incluindo encerramento)
            "session_id": session_id,
            "patient_data": result.get("patient_data", {}),
            "medical_summary": result.get("medical_summary"),
            "is_complete": result.get("is_complete", False),
            "current_stage": current_stage
        }
        
        # Adiciona texto transcrito se houver
        if transcribed_text:
            response_body["transcribed_text"] = transcribed_text
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(response_body, ensure_ascii=False, cls=DecimalEncoder)
        }
        
    except Exception as e:
        logger.error(f"❌ Erro no lambda_handler: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": f"Internal server error: {str(e)}"
            }, cls=DecimalEncoder)
        }


def _determine_stage(result: Dict[str, Any], messages: List) -> str:
    """
    Determina a etapa atual do atendimento baseado no estado.
    
    Args:
        result: Estado atual do workflow
        messages: Histórico de mensagens
    
    Returns:
        Etapa atual: "onboarding", "initial_symptoms", "detailing", "medical_history", "recommendation"
    """
    patient_data = result.get("patient_data", {})
    is_complete = result.get("is_complete", False)
    
    # Ordem de decisão das etapas:
    # 1. onboarding (se necessário)
    # 2. initial_symptoms
    # 3. detailing
    # 4. medical_history
    # 5. recommendation (se completo)

    has_onboarded = patient_data.get("has_onboarded", True)
    onboarding_complete = patient_data.get("onboarding_complete", False)
    human_msgs = [m for m in messages if m.__class__.__name__ == "HumanMessage"]
    symptoms = patient_data.get("symptoms", [])

    if not has_onboarded and not onboarding_complete:
        return "onboarding"
    if is_complete:
        return "recommendation"
    if len(human_msgs) <= 2 or not symptoms:
        return "initial_symptoms"
    if len(human_msgs) <= 5:
        return "detailing"
    return "medical_history"

