"""
Configurações para HybridStorage (Redis cache + DynamoDB persistência).
"""
import os


class StorageConfig:
    """Configurações para HybridStorage (sempre usa Redis + DynamoDB)."""
    
    # DynamoDB (persistência final quando is_complete=True)
    DYNAMODB_TABLE_NAME = os.getenv("SESSIONS_TABLE_NAME", "triagem-sessions")
    
    # Redis/ElastiCache (cache temporário para sessões ativas)
    REDIS_HOST = os.getenv("CACHE_ENDPOINT", "localhost")
    REDIS_PORT = int(os.getenv("CACHE_PORT", "6379"))
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    REDIS_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hora
    

