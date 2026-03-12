"""
Interface abstrata para storage de sessões.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class SessionStorageInterface(ABC):
    """
    Interface abstrata para backends de armazenamento de sessões.
    
    Implementações concretas:
    - DynamoDBStorage: Persistência durável na AWS
    - RedisStorage: Cache rápido com TTL (ElastiCache/Valkey)
    - MemoryStorage: Armazenamento em memória para testes
    - HybridStorage: Combina cache (Redis) + persistência (DynamoDB)
    """
    
    @abstractmethod
    def save_session(
        self, 
        session_id: str, 
        state: Dict[str, Any], 
        user_id: Optional[str] = None,
        **kwargs
    ) -> bool:
        """
        Salva o estado da sessão.
        
        Args:
            session_id: ID único da sessão
            state: Estado completo da conversa (dict com messages, patient_data, etc)
            user_id: ID do usuário (opcional)
            **kwargs: Argumentos específicos da implementação (ex: ttl para Redis)
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        pass
    
    @abstractmethod
    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega o estado da sessão.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            Estado da conversa ou None se não existir
        """
        pass
    
    @abstractmethod
    def delete_session(self, session_id: str) -> bool:
        """
        Deleta uma sessão.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se deletou com sucesso, False caso contrário
        """
        pass
    
    @abstractmethod
    def exists(self, session_id: str) -> bool:
        """
        Verifica se uma sessão existe.
        
        Args:
            session_id: ID único da sessão
            
        Returns:
            True se existe, False caso contrário
        """
        pass
    
    def list_sessions(self, user_id: Optional[str] = None) -> list:
        """
        Lista sessões (opcional, nem todos backends implementam).
        
        Args:
            user_id: Filtrar por usuário (opcional)
            
        Returns:
            Lista de session_ids
        """
        return []
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtém estatísticas do backend (opcional).
        
        Returns:
            Dicionário com estatísticas
        """
        return {"backend": self.__class__.__name__}
