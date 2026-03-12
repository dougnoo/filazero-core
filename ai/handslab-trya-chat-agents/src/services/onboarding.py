"""
Serviço de Onboarding - Envia dados de condições crônicas, medicamentos e alergias para API do tenant.
"""
import os
import logging
import requests
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class OnboardingService:
    """Serviço para enviar dados de onboarding para API do tenant."""
    
    def __init__(self):
        self.api_url = os.getenv("TENANT_API_URL")
        self.api_key = os.getenv("TENANT_API_KEY")
        
        if not self.api_url or not self.api_key:
            logger.warning("⚠️ TENANT_API_URL ou TENANT_API_KEY não configurados")
    
    def send_onboarding_data(
        self,
        user_id: str,
        chronic_conditions: list,
        medications: list,
        allergies: str
    ) -> bool:
        """
        Envia dados de onboarding para API do tenant.
        
        Primeiro tenta o endpoint /external (para primeiro onboarding).
        Se falhar com 409 (já completado), usa /health-data (update com merge).
        
        Args:
            user_id: ID do usuário
            chronic_conditions: Lista de condições crônicas
            medications: Lista de medicamentos
            allergies: String com alergias separadas por vírgula
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        if not self.api_url or not self.api_key:
            logger.error("❌ Configuração de API do tenant ausente")
            return False
        
        try:
            payload = {
                "userId": user_id,
                "chronicConditions": chronic_conditions,
                "medications": medications,
                "allergies": allergies
            }
            
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            }
            
            # Garante que URL tem protocolo
            base_url = self.api_url if self.api_url.startswith(('http://', 'https://')) else f'http://{self.api_url}'
            url = f"{base_url}/api/onboard/external"
            
            logger.info(f"📤 Enviando dados de onboarding para {url}")
            logger.info(f"📋 Payload: medications={medications}, allergies={allergies}, conditions={chronic_conditions}")
            
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            if response.status_code in [200, 201, 204]:
                logger.info(f"✅ Dados de onboarding enviados com sucesso")
                return True
            elif response.status_code == 409:
                # Onboarding já foi completado - usa endpoint de update com merge
                logger.info(f"ℹ️ Onboarding já completado, usando endpoint de update...")
                return self._update_health_data(user_id, chronic_conditions, medications, allergies)
            else:
                logger.error(f"❌ Erro ao enviar onboarding: {response.status_code} - {response.text}")
                # Tenta o endpoint de update como fallback
                logger.info(f"🔄 Tentando endpoint de update como fallback...")
                return self._update_health_data(user_id, chronic_conditions, medications, allergies)
                
        except Exception as e:
            logger.error(f"❌ Exceção ao enviar onboarding: {str(e)}")
            return False
    
    def _update_health_data(
        self,
        user_id: str,
        chronic_conditions: List[str],
        medications: List[str],
        allergies: str
    ) -> bool:
        """
        Atualiza dados de saúde usando o endpoint de update com merge.
        
        Args:
            user_id: ID do usuário
            chronic_conditions: Lista de nomes de condições crônicas
            medications: Lista de nomes de medicamentos
            allergies: String com alergias
            
        Returns:
            True se atualizado com sucesso, False caso contrário
        """
        try:
            # Garante que URL tem protocolo
            base_url = self.api_url if self.api_url.startswith(('http://', 'https://')) else f'http://{self.api_url}'
            url = f"{base_url}/api/onboard/health-data"
            
            payload: Dict[str, Any] = {
                "userId": user_id,
                "merge": True  # Adiciona aos dados existentes
            }
            
            # Adiciona apenas campos com dados
            if chronic_conditions and len(chronic_conditions) > 0:
                payload["chronicConditions"] = chronic_conditions
            if medications and len(medications) > 0:
                payload["medications"] = medications
            if allergies and allergies.strip():
                payload["allergies"] = allergies.strip()
            
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            }
            
            logger.info(f"📤 Atualizando dados de saúde em {url}")
            logger.info(f"📋 Payload: {payload}")
            
            response = requests.put(
                url,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            if response.status_code in [200, 201, 204]:
                logger.info(f"✅ Dados de saúde atualizados com sucesso")
                return True
            else:
                logger.error(f"❌ Erro ao atualizar dados de saúde: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Exceção ao atualizar dados de saúde: {str(e)}")
            return False
