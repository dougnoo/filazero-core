"""
RedisStorage - Cache rápido com TTL automático.
"""
import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from .base import SessionStorageInterface

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None  # type: ignore

logger = logging.getLogger(__name__)


class RedisStorage(SessionStorageInterface):
    """
    Armazena sessões no Redis/ElastiCache/Valkey (cache rápido com TTL).
    
    Ideal para:
    - Sessões ativas/temporárias
    - Alta performance (milhares de ops/segundo)
    - TTL automático (limpeza de sessões abandonadas)
    """
    
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        ttl: Optional[int] = None,
        db: int = 0,
        decode_responses: bool = True,
        ssl: bool = True
    ):
        """
        Inicializa storage Redis.
        
        Args:
            host: Endpoint do Redis (padrão: CACHE_ENDPOINT env var ou localhost)
            port: Porta do Redis (padrão: CACHE_PORT env var ou 6379)
            ttl: Time-to-live em segundos (padrão: CACHE_TTL env var ou 3600)
            db: Número do database Redis (padrão: 0)
            decode_responses: Decodificar respostas para string (padrão: True)
            ssl: Usar SSL/TLS (padrão: True para ElastiCache Serverless)
        """
        if not REDIS_AVAILABLE:
            logger.warning("⚠️ redis-py não instalado. RedisStorage desabilitado.")
            self.client = None
            return
        
        self.host = host or os.getenv("CACHE_ENDPOINT")
        self.port = int(port or os.getenv("CACHE_PORT", "6379"))
        self.ttl = int(ttl or os.getenv("CACHE_TTL", "3600"))
        self.db = db
        self.decode_responses = decode_responses
        self.ssl = ssl
        
        print(f"Redis config: host={self.host}, port={self.port}, ssl={self.ssl}")
        
        try:
            print(f"🔌 Criando cliente Redis para {self.host}:{self.port} (SSL: {self.ssl})...")
            self.client = redis.Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                decode_responses=self.decode_responses,
                ssl=self.ssl,
                ssl_cert_reqs=None if self.ssl else None,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=False,
                health_check_interval=30
            )
            print(f"✅ Cliente Redis criado, testando conexão com ping()...")
            # Testa conexão com timeout curto
            self.client.ping()
            print(f"✅ RedisStorage conectado a {self.host}:{self.port}")
        except redis.TimeoutError as e:
            print(f"⏱️ Timeout ao conectar ao Redis: {str(e)}")
            logger.error(f"❌ Timeout ao conectar ao Redis {self.host}:{self.port}: {str(e)}")
            self.client = None
        except redis.ConnectionError as e:
            print(f"🔌 Erro de conexão ao Redis: {str(e)}")
            logger.error(f"❌ Erro de conexão ao Redis {self.host}:{self.port}: {str(e)}")
            self.client = None
        except Exception as e:
            print(f"❌ Erro inesperado ao conectar ao Redis: {str(e)}")
            logger.error(f"❌ Erro ao conectar ao Redis: {str(e)}")
            self.client = None
    
    def _generate_key(self, session_id: str) -> str:
        """Gera chave Redis para a sessão."""
        return f"session:{session_id}"
    
    def save_session(
        self,
        session_id: str,
        state: Dict[str, Any],
        user_id: Optional[str] = None,
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """
        Salva sessão no Redis com TTL.
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa
            user_id: ID do usuário (opcional)
            ttl: TTL customizado em segundos (opcional)
            **kwargs: Argumentos adicionais (ignorados)
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        if not self.client:
            return False
        
        try:
            # Serializa mensagens preservando ou criando timestamp
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
            
            # Extrai campos principais
            is_complete = state.get("is_complete", False)
            status = "PENDING" if is_complete else "DRAFT"
            
            # Estrutura patient_data - SALVA TODOS OS CAMPOS
            base_patient_data = state.get("patient_data", {}) or {}
            medical_summary = state.get("medical_summary", {}) or {}
            
            # Preserva TODOS os campos de patient_data
            patient_data = dict(base_patient_data)
            patient_data["medical_summary"] = medical_summary or {}
            
            # Monta item para cache
            cache_item = {
                "session_id": session_id,
                "messages": serialized_messages,
                "updated_at": datetime.now().isoformat(),
                "is_complete": is_complete,
                "status": status,
                "patient_data": patient_data
            }
            
            if user_id:
                cache_item["user_id"] = user_id
            
            # Adiciona nome do paciente como atributo separado
            patient_name = base_patient_data.get("name")
            if patient_name:
                cache_item["patient_name"] = patient_name
            
            # Adiciona tenant_id como atributo separado
            tenant_id = kwargs.get("tenant_id")
            if tenant_id:
                cache_item["tenant_id"] = tenant_id
            
            # Adiciona urgency_level como atributo separado
            urgency_level = medical_summary.get("urgency_level") if isinstance(medical_summary, dict) else None
            if urgency_level:
                cache_item["urgency_level"] = urgency_level
            
            # Serializa para JSON
            cache_data = json.dumps(cache_item, ensure_ascii=False)
            
            # Salva no Redis com TTL
            key = self._generate_key(session_id)
            effective_ttl = ttl or self.ttl
            self.client.setex(key, effective_ttl, cache_data)
            
            logger.info(
                f"✅ Sessão {session_id} salva no Redis "
                f"(Status: {status}, TTL: {effective_ttl}s)"
            )
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar sessão {session_id} no Redis: {str(e)}")
            return False
    
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega sessão do Redis.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir
        """
        if not self.client:
            return None
        
        try:
            print(f"🔍 Buscando sessão {session_id} no Redis...")
            key = self._generate_key(session_id)
            cache_data = self.client.get(key)
            print(f"✅ Busca no Redis concluída: {cache_data is not None}")
            
            if not cache_data:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada no Redis")
                return None
            
            # Deserializa JSON
            cache_item = json.loads(cache_data)
            
            # Reconstrói mensagens LangChain preservando timestamp
            messages = []
            
            for msg_data in cache_item.get("messages", []):
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
            patient_data = cache_item.get("patient_data", {}) or {}
            medical_summary = patient_data.get("medical_summary") if isinstance(patient_data, dict) else None
            
            # Restaura nome do paciente do atributo separado
            if "patient_name" in cache_item:
                patient_data["name"] = cache_item["patient_name"]
            
            state = {
                "messages": messages,
                "next": "supervisor",
                "patient_data": patient_data,
                "is_complete": cache_item.get("is_complete", False),
                "medical_summary": medical_summary
            }
            
            ttl_remaining = self.client.ttl(key)
            logger.info(
                f"✅ Sessão {session_id} carregada do Redis "
                f"({len(messages)} mensagens, TTL: {ttl_remaining}s)"
            )
            return state
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Erro ao decodificar JSON da sessão {session_id}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao carregar sessão {session_id} do Redis: {str(e)}")
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """
        Deleta sessão do Redis.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se deletou com sucesso, False caso contrário
        """
        if not self.client:
            return False
        
        try:
            key = self._generate_key(session_id)
            deleted = self.client.delete(key)
            
            if deleted:
                logger.info(f"✅ Sessão {session_id} deletada do Redis")
                return True
            else:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada no Redis")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao deletar sessão {session_id} do Redis: {str(e)}")
            return False
    
    def exists(self, session_id: str) -> bool:
        """
        Verifica se sessão existe no Redis.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se existe, False caso contrário
        """
        if not self.client:
            return False
        
        try:
            key = self._generate_key(session_id)
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"❌ Erro ao verificar existência da sessão {session_id}: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtém estatísticas do Redis."""
        if not self.client:
            return {"backend": "RedisStorage", "connected": False}
        
        try:
            info = self.client.info()
            session_keys = self.client.keys("session:*")
            
            return {
                "backend": "RedisStorage",
                "connected": True,
                "total_sessions": len(session_keys),
                "redis_version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients")
            }
        except Exception as e:
            logger.error(f"❌ Erro ao obter stats do Redis: {str(e)}")
            return {"backend": "RedisStorage", "connected": False, "error": str(e)}
