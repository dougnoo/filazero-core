"""
DynamoDBStorage - Persistência durável no AWS DynamoDB.
"""
import os
import json
import boto3
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from .base import SessionStorageInterface

logger = logging.getLogger(__name__)


class DynamoDBStorage(SessionStorageInterface):
    """
    Armazena sessões no DynamoDB (persistência durável).
    
    Ideal para:
    - Persistência de longo prazo
    - Histórico de conversas completas
    - Auditoria e compliance
    """
    
    def __init__(self, table_name: Optional[str] = None):
        """
        Inicializa storage DynamoDB.
        
        Args:
            table_name: Nome da tabela DynamoDB (padrão: SESSIONS_TABLE_NAME env var)
        """
        self.table_name = table_name or os.getenv("SESSIONS_TABLE_NAME", "triagem-sessions")
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(self.table_name)  # type: ignore
        logger.info(f"✅ DynamoDBStorage conectado à tabela: {self.table_name}")
    
    def save_session(
        self, 
        session_id: str, 
        state: Dict[str, Any], 
        user_id: Optional[str] = None,
        **kwargs
    ) -> bool:
        """
        Salva sessão no DynamoDB.
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa
            user_id: ID do usuário (opcional)
            **kwargs: Argumentos adicionais (ignorados)
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        try:
            # Serializa mensagens LangChain preservando timestamp
            serialized_messages = []
            msgs_without_timestamp = 0
            
            for idx, msg in enumerate(state.get("messages", [])):
                # Preserva timestamp existente ou cria novo
                timestamp = msg.additional_kwargs.get("timestamp") if hasattr(msg, "additional_kwargs") else None
                if not timestamp:
                    timestamp = datetime.now().isoformat()
                    msgs_without_timestamp += 1
                    logger.warning(
                        f"⚠️ Msg {idx} ({msg.__class__.__name__}) sem timestamp: '{msg.content[:50]}...' "
                        f"- criando: {timestamp}"
                    )
                
                serialized_messages.append({
                    "type": msg.__class__.__name__,
                    "content": msg.content,
                    "timestamp": timestamp
                })
            
            if msgs_without_timestamp > 0:
                logger.warning(f"⚠️ Total de {msgs_without_timestamp}/{len(serialized_messages)} mensagens sem timestamp")
            
            # Extrai status e is_complete
            is_complete = state.get("is_complete", False)
            
            # Estrutura patient_data
            base_patient_data = state.get("patient_data", {}) or {}
            medical_summary = state.get("medical_summary", {}) or {}
            
            care_level = medical_summary.get("care_level", "")
            
            # Define status baseado em is_complete e care_level
            if is_complete and care_level in ("EMERGENCY_SAMU", "EMERGENCY_HOSPITAL", "TELEMEDICINE"):
                status = "COMPLETED"
            elif is_complete:
                status = "PENDING"
            else:
                status = "DRAFT"
            
            # Constrói patient_data preservando apenas campos com valores
            patient_data = {
                "symptoms": base_patient_data.get("symptoms", []),
                "medical_summary": medical_summary or {},
                "attachments": base_patient_data.get("attachments", []),
                "image_analyses": base_patient_data.get("image_analyses", [])
            }
            
            # Adiciona 'name' SOMENTE se houver valor (DynamoDB não salva None)
            patient_name_value = base_patient_data.get("name")
            if patient_name_value:
                patient_data["name"] = patient_name_value
            
            # Monta item DynamoDB
            item = {
                "session_id": session_id,
                "messages": serialized_messages,
                "updated_at": datetime.now().isoformat(),
                "is_complete": is_complete,
                "status": status,
                "patient_data": patient_data
            }
            
            if user_id:
                item["user_id"] = user_id
            
            # Adiciona nome do paciente como atributo separado (backup)
            # Prioriza: patient_data.name > base_patient_data.name > kwargs.patient_name
            patient_name = patient_data.get("name") or base_patient_data.get("name") or kwargs.get("patient_name")
            if patient_name:
                item["patient_name"] = patient_name
                logger.debug(f"👤 patient_name salvo como atributo separado: {patient_name}")
            
            # Adiciona tenant_id como atributo separado
            tenant_id = kwargs.get("tenant_id")
            if tenant_id:
                item["tenant_id"] = tenant_id
            
            # Adiciona urgency_level como atributo separado
            ms = patient_data.get("medical_summary", {})
            urgency = ms.get("urgency_level", "") if isinstance(ms, dict) else ""
            if urgency:
                item["urgency_level"] = urgency
            
            # Adiciona current_stage como atributo separado
            current_stage = state.get("current_stage", "")
            if current_stage:
                item["current_stage"] = current_stage
            
            # Salva no DynamoDB
            self.table.put_item(Item=item)
            
            logger.info(
                f"✅ Sessão {session_id} salva no DynamoDB "
                f"(Status: {status}, Type: {care_level}, Urgency: {urgency}, Stage: {current_stage})"
            )
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar sessão {session_id} no DynamoDB: {str(e)}")
            return False
    
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega sessão do DynamoDB.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir
        """
        try:
            response = self.table.get_item(Key={"session_id": session_id})
            
            if "Item" not in response:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada no DynamoDB")
                return None
            
            item = response["Item"]
            
            # Reconstrói mensagens LangChain preservando timestamp
            messages = []
            
            for msg_data in item.get("messages", []):
                msg_type = msg_data.get("type", "HumanMessage")
                content = msg_data.get("content", "")
                timestamp = msg_data.get("timestamp")  # Preserva timestamp
                
                # Cria mensagem
                if msg_type == "HumanMessage":
                    msg = HumanMessage(content=content)
                elif msg_type == "AIMessage":
                    msg = AIMessage(content=content)
                elif msg_type == "SystemMessage":
                    msg = SystemMessage(content=content)
                else:
                    msg = HumanMessage(content=content)
                
                # Adiciona timestamp ao additional_kwargs (se existir)
                if timestamp:
                    msg.additional_kwargs["timestamp"] = timestamp
                
                messages.append(msg)
            
            # Reconstrói estado
            patient_data = item.get("patient_data", {}) or {}
            medical_summary = patient_data.get("medical_summary") if isinstance(patient_data, dict) else None
            
            # Restaura nome do paciente:
            # 1. Se não tem 'name' em patient_data, tira do atributo separado 'patient_name'
            # 2. Garante que sempre há um nome se estava salvo
            if "patient_name" in item and not patient_data.get("name"):
                patient_data["name"] = item["patient_name"]
                logger.debug(f"👤 Nome restaurado do atributo separado: {item['patient_name']}")
            
            state = {
                "messages": messages,
                "next": "supervisor",
                "patient_data": patient_data,
                "is_complete": item.get("is_complete", False),
                "medical_summary": medical_summary
            }
            
            logger.info(f"✅ Sessão {session_id} carregada do DynamoDB ({len(messages)} mensagens)")
            return state
            
        except Exception as e:
            logger.error(f"❌ Erro ao carregar sessão {session_id} do DynamoDB: {str(e)}")
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """
        Deleta sessão do DynamoDB.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se deletou com sucesso, False caso contrário
        """
        try:
            self.table.delete_item(Key={"session_id": session_id})
            logger.info(f"✅ Sessão {session_id} deletada do DynamoDB")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao deletar sessão {session_id} do DynamoDB: {str(e)}")
            return False
    
    def exists(self, session_id: str) -> bool:
        """
        Verifica se sessão existe no DynamoDB.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se existe, False caso contrário
        """
        try:
            response = self.table.get_item(
                Key={"session_id": session_id},
                ProjectionExpression="session_id"  # Otimização: busca apenas a chave
            )
            return "Item" in response
            
        except Exception as e:
            logger.error(f"❌ Erro ao verificar existência da sessão {session_id}: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtém estatísticas do DynamoDB."""
        try:
            table_info = self.table.table_status
            item_count = self.table.item_count
            
            return {
                "backend": "DynamoDBStorage",
                "table_name": self.table_name,
                "table_status": table_info,
                "item_count": item_count
            }
        except Exception as e:
            logger.error(f"❌ Erro ao obter stats do DynamoDB: {str(e)}")
            return {"backend": "DynamoDBStorage", "error": str(e)}
