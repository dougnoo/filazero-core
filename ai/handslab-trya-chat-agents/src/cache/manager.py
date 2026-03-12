"""
Gerenciador de Cache - Persiste sessões temporárias no ElastiCache/Valkey.
"""
import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None  # type: ignore

logger = logging.getLogger(__name__)


class CacheManager:
    """Gerencia persistência temporária de sessões no ElastiCache/Valkey."""
    
    def __init__(
        self, 
        host: Optional[str] = None,
        port: Optional[int] = None,
        ttl: Optional[int] = None,
        db: int = 0,
        decode_responses: bool = True
    ):
        """
        Inicializa o gerenciador de cache.
        
        Args:
            host: Endpoint do ElastiCache/Valkey (padrão: CACHE_ENDPOINT env var)
            port: Porta do Redis (padrão: CACHE_PORT env var ou 6379)
            ttl: Time-to-live em segundos (padrão: CACHE_TTL env var ou 3600 = 1 hora)
            db: Número do database Redis (padrão: 0)
            decode_responses: Decodificar respostas para string (padrão: True)
        """
        if not REDIS_AVAILABLE:
            logger.warning("⚠️ redis-py não instalado. Cache desabilitado.")
            self.client = None
            return
        
        self.host = host or os.getenv("CACHE_ENDPOINT", "localhost")
        self.port = int(port or os.getenv("CACHE_PORT", "6379"))
        self.ttl = int(ttl or os.getenv("CACHE_TTL", "3600"))  # 1 hora padrão
        self.db = db
        self.decode_responses = decode_responses
        
        try:
            self.client = redis.Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                decode_responses=self.decode_responses,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Testa conexão
            self.client.ping()
            logger.info(f"✅ Conectado ao Redis/Valkey em {self.host}:{self.port}")
        except Exception as e:
            logger.error(f"❌ Erro ao conectar ao Redis/Valkey: {str(e)}")
            self.client = None
    
    def _generate_key(self, session_id: str) -> str:
        """
        Gera chave Redis para a sessão.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Chave formatada (ex: session:abc-123)
        """
        return f"session:{session_id}"
    
    def save_session(
        self, 
        session_id: str, 
        state: Dict[str, Any], 
        user_id: Optional[str] = None,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Salva o estado da sessão no cache.
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa
            user_id: ID do usuário (opcional)
            ttl: Time-to-live customizado em segundos (opcional)
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        if not self.client:
            logger.warning(f"⚠️ Cache desabilitado, não foi possível salvar sessão {session_id}")
            return False
        
        try:
            # Serializa mensagens (mantém compatibilidade com DynamoDB)
            serialized_messages = []
            for msg in state.get("messages", []):
                serialized_messages.append({
                    "type": msg.__class__.__name__,
                    "content": msg.content
                })
            
            # Extrai campos principais
            is_complete = state.get("is_complete", False)
            status = "PENDING" if is_complete else "DRAFT"
            
            # Estrutura patient_data (compatível com DynamoDB)
            base_patient_data = state.get("patient_data", {}) or {}
            medical_summary = state.get("medical_summary", {}) or {}
            
            patient_data = {
                "symptoms": base_patient_data.get("symptoms", []),
                "medical_summary": medical_summary or {},
                "attachments": base_patient_data.get("attachments", []),
                "image_analyses": base_patient_data.get("image_analyses", [])
            }
            
            # Monta item para cache (estrutura idêntica ao DynamoDB)
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
            
            # Serializa para JSON
            cache_data = json.dumps(cache_item, ensure_ascii=False)
            
            # Salva no Redis com TTL
            key = self._generate_key(session_id)
            effective_ttl = ttl or self.ttl
            self.client.setex(key, effective_ttl, cache_data)
            
            logger.info(
                f"✅ Sessão {session_id} salva no cache "
                f"(Status: {status}, TTL: {effective_ttl}s, Size: {len(cache_data)} bytes)"
            )
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar sessão {session_id} no cache: {str(e)}")
            return False
    
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega o estado da sessão do cache.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir
        """
        if not self.client:
            logger.warning(f"⚠️ Cache desabilitado, não foi possível carregar sessão {session_id}")
            return None
        
        try:
            key = self._generate_key(session_id)
            cache_data = self.client.get(key)
            
            if not cache_data:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada no cache")
                return None
            
            # Deserializa JSON
            cache_item = json.loads(cache_data)
            
            # Reconstrói mensagens LangChain
            messages = []
            for msg_data in cache_item.get("messages", []):
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
            
            # Reconstrói estado completo
            patient_data = cache_item.get("patient_data", {}) or {}
            medical_summary = patient_data.get("medical_summary") if isinstance(patient_data, dict) else None
            
            state = {
                "messages": messages,
                "next": "supervisor",
                "patient_data": patient_data,
                "is_complete": cache_item.get("is_complete", False),
                "medical_summary": medical_summary
            }
            
            logger.info(
                f"✅ Sessão {session_id} carregada do cache "
                f"({len(messages)} mensagens, TTL restante: {self.client.ttl(key)}s)"
            )
            return state
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Erro ao decodificar JSON da sessão {session_id}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao carregar sessão {session_id} do cache: {str(e)}")
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """
        Deleta uma sessão do cache.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se deletou com sucesso, False caso contrário
        """
        if not self.client:
            logger.warning(f"⚠️ Cache desabilitado, não foi possível deletar sessão {session_id}")
            return False
        
        try:
            key = self._generate_key(session_id)
            deleted = self.client.delete(key)
            
            if deleted:
                logger.info(f"✅ Sessão {session_id} deletada do cache")
                return True
            else:
                logger.info(f"ℹ️  Sessão {session_id} não encontrada no cache para deletar")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao deletar sessão {session_id} do cache: {str(e)}")
            return False
    
    def extend_ttl(self, session_id: str, ttl: Optional[int] = None) -> bool:
        """
        Estende o TTL de uma sessão existente.
        
        Args:
            session_id: ID único da sessão
            ttl: Novo TTL em segundos (opcional, usa self.ttl se não fornecido)
            
        Returns:
            True se estendeu com sucesso, False caso contrário
        """
        if not self.client:
            return False
        
        try:
            key = self._generate_key(session_id)
            effective_ttl = ttl or self.ttl
            result = self.client.expire(key, effective_ttl)
            
            if result:
                logger.debug(f"✅ TTL da sessão {session_id} estendido para {effective_ttl}s")
                return True
            else:
                logger.debug(f"⚠️ Sessão {session_id} não encontrada para estender TTL")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao estender TTL da sessão {session_id}: {str(e)}")
            return False
    
    def get_ttl(self, session_id: str) -> int:
        """
        Obtém o TTL restante de uma sessão.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            TTL em segundos, -1 se não tem TTL, -2 se não existe
        """
        if not self.client:
            return -2
        
        try:
            key = self._generate_key(session_id)
            return self.client.ttl(key)
        except Exception as e:
            logger.error(f"❌ Erro ao obter TTL da sessão {session_id}: {str(e)}")
            return -2
    
    def exists(self, session_id: str) -> bool:
        """
        Verifica se uma sessão existe no cache.
        
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
    
    def is_connected(self) -> bool:
        """
        Verifica se a conexão com Redis está ativa.
        
        Returns:
            True se conectado, False caso contrário
        """
        if not self.client:
            return False
        
        try:
            self.client.ping()
            return True
        except Exception:
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtém estatísticas do cache.
        
        Returns:
            Dicionário com estatísticas (keys, memory, etc)
        """
        if not self.client:
            return {"connected": False}
        
        try:
            info = self.client.info()
            session_keys = self.client.keys("session:*")
            
            return {
                "connected": True,
                "total_sessions": len(session_keys),
                "redis_version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_seconds": info.get("uptime_in_seconds")
            }
        except Exception as e:
            logger.error(f"❌ Erro ao obter estatísticas do cache: {str(e)}")
            return {"connected": False, "error": str(e)}
