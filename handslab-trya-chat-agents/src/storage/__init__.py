"""
Storage module - HybridStorage (Redis cache + DynamoDB persistência).
"""
from .base import SessionStorageInterface
from .factory import get_storage

__all__ = ['SessionStorageInterface', 'get_storage']
