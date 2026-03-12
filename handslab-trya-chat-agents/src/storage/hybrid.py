"""
HybridStorage - Combina cache (Redis) + persistência (DynamoDB).
"""
import logging
from typing import Dict, Any, Optional
from .base import SessionStorageInterface
from .redis import RedisStorage
from .dynamodb import DynamoDBStorage

logger = logging.getLogger(__name__)


class HybridStorage(SessionStorageInterface):
    """
    Storage híbrido: Redis para cache rápido + DynamoDB para persistência.
    
    Estratégia:
    1. SAVE: Sempre salva no Redis (cache rápido)
           + Salva no DynamoDB apenas quando is_complete=True
    2. LOAD: Tenta Redis primeiro (rápido)
           + Se não encontrar, tenta DynamoDB (fallback)
           + Se encontrar no DynamoDB, popula o Redis
    3. DELETE: Deleta de ambos
    
    Benefícios:
    - ✅ Performance: Redis para operações frequentes
    - ✅ Durabilidade: DynamoDB para histórico permanente
    - ✅ Custo otimizado: Menos writes no DynamoDB
    - ✅ Resiliência: Fallback automático se Redis falhar
    """
    
    def __init__(
        self,
        cache_kwargs: Optional[Dict[str, Any]] = None,
        persistence_kwargs: Optional[Dict[str, Any]] = None,
        save_to_persistence_on_complete: bool = True,
        always_save_to_persistence: bool = False
    ):
        """
        Inicializa storage híbrido.
        
        Args:
            cache_kwargs: Argumentos para RedisStorage
            persistence_kwargs: Argumentos para DynamoDBStorage
            save_to_persistence_on_complete: Salva no DynamoDB quando is_complete=True
            always_save_to_persistence: Sempre salva no DynamoDB (ignora is_complete)
        """
        self.cache = RedisStorage(**(cache_kwargs or {}))
        self.persistence = DynamoDBStorage(**(persistence_kwargs or {}))
        self.save_to_persistence_on_complete = save_to_persistence_on_complete
        self.always_save_to_persistence = always_save_to_persistence
        
        logger.info(
            f"✅ HybridStorage inicializado "
            f"(Cache: {'Redis' if self.cache.client else 'Disabled'}, "
            f"Persistence: DynamoDB)"
        )
    
    def save_session(
        self,
        session_id: str,
        state: Dict[str, Any],
        user_id: Optional[str] = None,
        force_persistence: bool = False,
        **kwargs
    ) -> bool:
        """
        Salva sessão no storage híbrido.
        
        Estratégia:
        1. Sempre salva no Redis (cache)
        2. Salva no DynamoDB se:
           - always_save_to_persistence=True, OU
           - is_complete=True e save_to_persistence_on_complete=True, OU
           - force_persistence=True
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa
            user_id: ID do usuário (opcional)
            force_persistence: Força salvamento no DynamoDB
            **kwargs: Argumentos adicionais (ex: ttl para Redis)
            
        Returns:
            True se salvou com sucesso em pelo menos um backend
        """
        cache_saved = False
        persistence_saved = False
        
        # 1. Salva no cache (Redis)
        if self.cache.client:
            cache_saved = self.cache.save_session(session_id, state, user_id, **kwargs)
        else:
            logger.warning(f"⚠️ Redis indisponível, pulando cache para {session_id}")
        
        # 2. Decide se salva na persistência (DynamoDB)
        should_persist = (
            self.always_save_to_persistence or
            force_persistence or
            (self.save_to_persistence_on_complete and state.get("is_complete", False))
        )
        
        if should_persist:
            persistence_saved = self.persistence.save_session(session_id, state, user_id, **kwargs)
            
            if persistence_saved and state.get("is_complete"):
                logger.info(f"📦 Sessão {session_id} FINALIZADA e persistida no DynamoDB")

            # Se persistiu com sucesso, remove versão em cache para evitar stale
            if persistence_saved and self.cache.client:
                deleted_cache = self.cache.delete_session(session_id)
                if deleted_cache:
                    logger.info(f"🧹 Cache Redis limpo para sessão {session_id} após persistência no DynamoDB")
                else:
                    logger.warning(f"⚠️ Falha ao limpar cache Redis para sessão {session_id} após persistência")
        
        # Sucesso se salvou em pelo menos um
        success = cache_saved or persistence_saved
        
        if not success:
            logger.error(f"❌ Falha ao salvar sessão {session_id} em TODOS os backends")
        
        return success
    
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega sessão do storage híbrido.
        
        Estratégia:
        1. Tenta Redis primeiro (rápido)
        2. Se não encontrar, tenta DynamoDB (fallback)
        3. Se encontrar no DynamoDB, popula o Redis para próxima vez
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir em nenhum backend
        """
        # 1. Tenta cache primeiro (Redis)
        if self.cache.client:
            state = self.cache.load_session(session_id)
            if state:
                logger.debug(f"🚀 Cache HIT: Sessão {session_id} carregada do Redis")
                return state
            logger.debug(f"💨 Cache MISS: Sessão {session_id} não está no Redis")
        
        # 2. Fallback para persistência (DynamoDB)
        state = self.persistence.load_session(session_id)
        
        if state:
            logger.info(f"📂 Sessão {session_id} recuperada do DynamoDB (fallback)")
            
            # 3. Popula cache para próximas requisições (warm-up)
            if self.cache.client:
                cache_populated = self.cache.save_session(session_id, state)
                if cache_populated:
                    logger.debug(f"♻️  Cache populado com sessão {session_id}")
            
            return state
        
        # Não encontrou em nenhum backend
        logger.info(f"ℹ️  Sessão {session_id} não encontrada (cache nem persistência)")
        return None
    
    def delete_session(self, session_id: str) -> bool:
        """
        Deleta sessão de ambos os backends.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se deletou de pelo menos um backend
        """
        cache_deleted = False
        persistence_deleted = False
        
        # Deleta do cache
        if self.cache.client:
            cache_deleted = self.cache.delete_session(session_id)
        
        # Deleta da persistência
        persistence_deleted = self.persistence.delete_session(session_id)
        
        success = cache_deleted or persistence_deleted
        
        if success:
            logger.info(f"🗑️  Sessão {session_id} deletada dos backends híbridos")
        
        return success
    
    def exists(self, session_id: str) -> bool:
        """
        Verifica se sessão existe em algum backend.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se existe em cache OU persistência
        """
        # Verifica cache primeiro (mais rápido)
        if self.cache.client and self.cache.exists(session_id):
            return True
        
        # Verifica persistência
        return self.persistence.exists(session_id)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtém estatísticas combinadas dos backends.
        
        Returns:
            Dicionário com estatísticas de cache e persistência
        """
        cache_stats = self.cache.get_stats() if self.cache.client else {"connected": False}
        persistence_stats = self.persistence.get_stats()
        
        return {
            "backend": "HybridStorage",
            "cache": cache_stats,
            "persistence": persistence_stats,
            "strategy": {
                "save_to_persistence_on_complete": self.save_to_persistence_on_complete,
                "always_save_to_persistence": self.always_save_to_persistence
            }
        }
    
    def sync_to_persistence(self, session_id: str) -> bool:
        """
        Força sincronização de uma sessão do cache para persistência.
        
        Útil para:
        - Backup manual
        - Migração de dados
        - Testes
        
        Args:
            session_id: ID da sessão para sincronizar
            
        Returns:
            True se sincronizou com sucesso
        """
        if not self.cache.client:
            logger.warning(f"⚠️ Cache indisponível, não é possível sincronizar {session_id}")
            return False
        
        # Carrega do cache
        state = self.cache.load_session(session_id)
        if not state:
            logger.warning(f"⚠️ Sessão {session_id} não encontrada no cache para sincronizar")
            return False
        
        # Salva na persistência
        success = self.persistence.save_session(session_id, state)
        
        if success:
            logger.info(f"🔄 Sessão {session_id} sincronizada para persistência")
        
        return success
