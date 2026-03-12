"""
Factory para criação de HybridStorage (sempre Redis + DynamoDB).
"""
import os
import logging
from typing import Optional
from .base import SessionStorageInterface
from .config import StorageConfig

logger = logging.getLogger(__name__)


class StorageFactory:
    """Factory simplificada - sempre retorna HybridStorage."""
    
    _instance: Optional[SessionStorageInterface] = None  # Singleton
    
    @classmethod
    def create(cls) -> SessionStorageInterface:
        """
        Cria HybridStorage com configurações do ambiente.
        
        Variáveis de ambiente:
            SESSIONS_TABLE_NAME: Tabela DynamoDB
            CACHE_ENDPOINT: Endpoint Redis/ElastiCache
            CACHE_PORT: Porta Redis (padrão: 6379)
            CACHE_TTL: TTL em segundos (padrão: 3600)
            
        Returns:
            Instância de HybridStorage configurada
        """
        # Singleton: retorna instância existente
        if cls._instance is not None:
            return cls._instance
        
        from .hybrid import HybridStorage
        
        # Configura cache (Redis)
        cache_kwargs = {
            "host": StorageConfig.REDIS_HOST,
            "port": StorageConfig.REDIS_PORT,
            "db": StorageConfig.REDIS_DB,
            "ttl": StorageConfig.REDIS_TTL
        }
        
        # Configura persistência (DynamoDB)
        persistence_kwargs = {
            "table_name": StorageConfig.DYNAMODB_TABLE_NAME
        }
        
        # Cria HybridStorage
        cls._instance = HybridStorage(
            cache_kwargs=cache_kwargs,
            persistence_kwargs=persistence_kwargs,
            save_to_persistence_on_complete=True,  # Salva no DynamoDB quando is_complete=True
            always_save_to_persistence=False
        )
        
        logger.info(
            f"✅ HybridStorage criado | "
            f"Redis: {cache_kwargs['host']}:{cache_kwargs['port']} | "
            f"DynamoDB: {persistence_kwargs['table_name']}"
        )
        
        return cls._instance
    
    @classmethod
    def clear_cache(cls):
        """Limpa instância cacheada (útil para testes)."""
        cls._instance = None


# Função auxiliar para obter storage global
_global_storage: Optional[SessionStorageInterface] = None


def get_storage(force_recreate: bool = False) -> SessionStorageInterface:
    """
    Obtém instância global de storage (singleton).
    
    Args:
        force_recreate: Força recriação da instância
        
    Returns:
        Instância global do storage backend
    """
    global _global_storage
    
    if _global_storage is None or force_recreate:
        _global_storage = StorageFactory.create_from_env()
    
    return _global_storage
def get_storage() -> SessionStorageInterface:
    """
    Obtém instância global de HybridStorage (singleton).
    
    Returns:
        Instância de HybridStorage configurada
    """
    return StorageFactory.create()