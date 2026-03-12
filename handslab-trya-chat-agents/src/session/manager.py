"""
Gerenciador de Sessões - Persiste conversas entre invocações Lambda.
"""
import os
import json
import boto3
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

logger = logging.getLogger(__name__)


class SessionManager:
    """Gerencia persistência de sessões de conversa no DynamoDB."""
    
    def __init__(self, table_name: Optional[str] = None):
        """
        Inicializa o gerenciador de sessões.
        
        Args:
            table_name: Nome da tabela DynamoDB (padrão: SESSIONS_TABLE_NAME env var)
        """
        self.table_name = table_name or os.getenv("SESSIONS_TABLE_NAME", "triagem-sessions")
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(self.table_name)  # type: ignore        
    
    def save_session(self, session_id: str, state: Dict[str, Any], user_id: Optional[str] = None) -> None:
        """
        Salva o estado da sessão no DynamoDB.
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa
            user_id: ID do usuário (opcional)
        """
        try:
            # Serializa APENAS as mensagens (para campo 'messages')
            serialized_messages = []
            for msg in state.get("messages", []):
                serialized_messages.append({
                    "type": msg.__class__.__name__,
                    "content": msg.content
                })
            
            # Extrai status e is_complete
            is_complete = state.get("is_complete", False)
            status = "PENDING" if is_complete else "DRAFT"

            # Extrai patient_data e medical_summary para compor um único Map consultável
            base_patient_data = state.get("patient_data", {}) or {}
            medical_summary = state.get("medical_summary", {}) or {}

            # Campos exigidos dentro de patient_data (apenas medical_summary completo, sem duplicação)
            patient_data = {
                "symptoms": base_patient_data.get("symptoms", []),
                "medical_summary": medical_summary or {},
                "attachments": base_patient_data.get("attachments", []),
                "image_analyses": base_patient_data.get("image_analyses", [])
            }

            item = {
                "session_id": session_id,
                # Agora salvamos somente as mensagens no atributo 'messages'
                "messages": serialized_messages,
                "updated_at": datetime.now().isoformat(),                
                "is_complete": is_complete,
                "status": status,
                # Armazena como Map nativo no DynamoDB (não string)
                "patient_data": patient_data
            }
            
            if user_id:
                item["user_id"] = user_id
            
            self.table.put_item(Item=item)
            ms = patient_data.get("medical_summary", {})
            urgency = ms.get("urgency_level", "") if isinstance(ms, dict) else ""
            logger.info(
                f"✅ Sessão {session_id} salva (Status: {status}) | patient_data keys: "
                f"{list(patient_data.keys())} | urgency={urgency}"
            )
            if isinstance(ms, dict) and not any(ms.get(k) for k in ["conversation_summary", "main_symptoms", "chief_complaint"]):
                logger.warning(
                    f"⚠️ Campos de resumo vazios em {session_id}. Pode ser antes do summarizer ou um problema de geração."
                )
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar sessão {session_id}: {str(e)}")
            raise
    
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega o estado da sessão do DynamoDB.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir
        """
        try:
            response = self.table.get_item(Key={"session_id": session_id})
            
            if "Item" not in response:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada, iniciando nova")
                return None
            
            item = response["Item"]

            # Compatibilidade: itens antigos podem ter 'state' serializado em JSON
            if "messages" in item:
                # Reconstrói mensagens a partir de 'messages'
                messages_serialized = item.get("messages", [])
                # Reutiliza lógica de desserialização de mensagens
                messages = []
                for msg_data in messages_serialized:
                    msg_type = msg_data.get("type", "HumanMessage")
                    content = msg_data.get("content", "")
                    if msg_type == "HumanMessage":
                        messages.append(HumanMessage(content=content))
                    elif msg_type == "AIMessage":
                        messages.append(AIMessage(content=content))
                    elif msg_type == "SystemMessage":
                        messages.append(SystemMessage(content=content))
                    else:
                        messages.append(HumanMessage(content=content))

                # Monta estado a partir dos demais atributos
                patient_data = item.get("patient_data", {}) or {}
                medical_summary = patient_data.get("medical_summary") if isinstance(patient_data, dict) else None
                state = {
                    "messages": messages,
                    "next": "supervisor",
                    "patient_data": patient_data,
                    "is_complete": item.get("is_complete", False),
                    "medical_summary": medical_summary
                }
            else:
                # Fallback para itens antigos com 'state' JSON
                serialized_state = json.loads(item["state"]) if isinstance(item.get("state"), str) else item.get("state", {})
                state = self._deserialize_state(serialized_state)
            
            logger.info(f"✅ Sessão {session_id} carregada com {len(state.get('messages', []))} mensagens")
            return state
            
        except Exception as e:
            logger.error(f"❌ Erro ao carregar sessão {session_id}: {str(e)}")
            # Retorna None ao invés de falhar - permite continuar com nova sessão
            return None
    
    def delete_session(self, session_id: str) -> None:
        """
        Deleta uma sessão do DynamoDB.
        
        Args:
            session_id: ID único da sessão
        """
        try:
            self.table.delete_item(Key={"session_id": session_id})
            logger.info(f"✅ Sessão {session_id} deletada")
        except Exception as e:
            logger.error(f"❌ Erro ao deletar sessão {session_id}: {str(e)}")
    
    def _serialize_state(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Serializa o estado para JSON, convertendo mensagens LangChain."""
        serialized = {}
        
        for key, value in state.items():
            if key == "messages":
                # Serializa mensagens LangChain
                serialized[key] = [
                    {
                        "type": msg.__class__.__name__,
                        "content": msg.content
                    }
                    for msg in value
                ]
            else:
                # Mantém outros campos como estão
                serialized[key] = value
        
        return serialized
    
    def _deserialize_state(self, serialized: Dict[str, Any]) -> Dict[str, Any]:
        """Deserializa o estado JSON, reconstruindo mensagens LangChain."""
        state = {}
        
        for key, value in serialized.items():
            if key == "messages":
                # Reconstrói mensagens LangChain
                messages = []
                for msg_data in value:
                    msg_type = msg_data.get("type", "HumanMessage")
                    content = msg_data.get("content", "")
                    
                    if msg_type == "HumanMessage":
                        messages.append(HumanMessage(content=content))
                    elif msg_type == "AIMessage":
                        messages.append(AIMessage(content=content))
                    elif msg_type == "SystemMessage":
                        messages.append(SystemMessage(content=content))
                    else:
                        # Fallback para HumanMessage
                        messages.append(HumanMessage(content=content))
                
                state[key] = messages
            else:
                state[key] = value
        
        return state
