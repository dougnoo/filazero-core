"""
Serviço de integração com API da Trya.
"""
import os
import json
import logging
import requests
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class TryaIntegrationService:
    """Serviço para enviar dados de triagem para a API da Trya."""
    
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        """
        Inicializa o serviço de integração com Trya.
        
        Args:
            base_url: URL base da API Trya (padrão: TRYA_API_PLATFORM_URL env var)
            api_key: Chave de API para autenticação (padrão: TRYA_API_PLATFORM_KEY env var)
        """
        self.base_url = (base_url or os.getenv("TRYA_API_PLATFORM_URL", "")).rstrip("/")
        self.api_key = api_key or os.getenv("TRYA_API_PLATFORM_KEY", "")
        
        if not self.base_url:
            logger.warning("⚠️ TRYA_API_PLATFORM_URL não configurada. Integração desabilitada.")
        if not self.api_key:
            logger.warning("⚠️ TRYA_API_PLATFORM_KEY não configurada. Integração desabilitada.")
        
        self.enabled = bool(self.base_url and self.api_key)
        
        # Sessão HTTP persistente (reutiliza conexões)
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        if self.enabled:
            logger.info(f"✅ TryaIntegrationService habilitado: {self.base_url}")
    
    def send_triage_data(
        self,
        session_id: str,
        patient_data: Dict[str, Any],
        patient_name: Optional[str] = None,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        updated_at: Optional[str] = None
    ) -> bool:
        """
        Envia dados de triagem para a API da Trya.
        
        Args:
            session_id: ID da sessão
            patient_data: Dados completos do paciente
            patient_name: Nome do paciente
            user_id: ID do usuário
            tenant_id: ID do tenant
            updated_at: Timestamp da última atualização
            
        Returns:
            True se enviou com sucesso, False caso contrário
        """
        if not self.enabled:
            logger.debug("ℹ️ Integração Trya desabilitada, pulando envio")
            return False
        
        try:
            import time
            start_time = time.time()
            
            # Formata patient_data no formato esperado pela Trya
            medical_summary = patient_data.get("medical_summary", {})
            if isinstance(medical_summary, dict):
                # Remove campos não aceitos pela API
                excluded_fields = {
                    "care_level",
                    "collected_allergies",
                    "collected_medications",
                    "collected_chronic_conditions"
                }
                medical_summary = {k: v for k, v in medical_summary.items() if k not in excluded_fields}
            
            formatted_patient_data = {
                "name": patient_data.get("name"),
                "symptoms": patient_data.get("symptoms", []),
                "image_analyses": patient_data.get("image_analyses", []),
                "attachments": patient_data.get("attachments", []),
                "medical_summary": medical_summary
            }
            
            # Monta payload no formato exato da Trya
            payload = {
                "session_id": session_id,
                "patient_data": formatted_patient_data,
                "patient_name": patient_name or patient_data.get("name"),
                "user_id": user_id,
                "tenant_id": tenant_id,
                "updated_at": updated_at or datetime.now().isoformat()
            }
            
            # Endpoint
            endpoint = f"{self.base_url}/api/medical-approval-requests"
            
            logger.info(f"📤 Enviando para Trya: {endpoint}")
            logger.info(f"Resumo: session_id={session_id}, user_id={user_id}")
            logger.info(f"🌐 Testando conectividade de rede...")
            logger.debug(f"Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
            
            # Timeout reduzido para não bloquear Lambda
            timeout = 15  # 15s por tentativa
            max_retries = 2  # Apenas 2 tentativas (total ~30s)
            
            for attempt in range(max_retries):
                try:
                    logger.info(f"📡 Tentativa {attempt + 1}/{max_retries} (timeout: {timeout}s)...")
                    response = self.session.post(
                        endpoint,
                        json=payload,
                        headers={"x-api-key": self.api_key},
                        timeout=timeout
                    )
                    break
                except requests.exceptions.Timeout:
                    if attempt < max_retries - 1:
                        logger.warning(f"⏱️ Timeout, tentando novamente...")
                        continue
                    raise
            
            # Verifica resposta
            elapsed_time = time.time() - start_time
            logger.info(f"⏱️ Tempo de requisição: {elapsed_time:.2f}s")
            
            response.raise_for_status()
            
            response_data = response.json() if response.text else {}
            logger.info(f"✅ Dados enviados com sucesso para Trya (status: {response.status_code})")
            logger.debug(f"Resposta Trya: {json.dumps(response_data, ensure_ascii=False)}")
            return True
            
        except requests.exceptions.Timeout as e:
            elapsed_time = time.time() - start_time
            logger.error(f"❌ TIMEOUT após {elapsed_time:.2f}s ao conectar com Trya")
            logger.error(f"Endpoint: {endpoint}")
            logger.error(f"⚠️ DIAGNÓSTICO: Lambda em VPC não consegue acessar API externa")
            logger.error(f"Verifique: 1) NAT Gateway ativo, 2) Route Table com rota 0.0.0.0/0 -> NAT, 3) Security Group permite saída")
            return False
        except requests.exceptions.ConnectionError as e:
            elapsed_time = time.time() - start_time
            logger.error(f"❌ ERRO DE CONEXÃO após {elapsed_time:.2f}s: {str(e)}")
            logger.error(f"⚠️ DIAGNÓSTICO: Não consegue resolver DNS ou conectar com {self.base_url}")
            logger.error(f"Verifique: 1) DNS resolution na VPC, 2) Security Group, 3) NACL")
            return False
        except requests.exceptions.RequestException as e:
            elapsed_time = time.time() - start_time
            logger.error(f"❌ Erro HTTP após {elapsed_time:.2f}s: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.status_code} - {e.response.text}")
            return False
        except Exception as e:
            elapsed_time = time.time() - start_time
            logger.error(f"❌ Erro inesperado após {elapsed_time:.2f}s: {str(e)}", exc_info=True)
            return False
    
    def save_collected_health_data(
        self,
        user_id: str,
        allergies: Optional[str] = None,
        medications: Optional[list] = None,
        chronic_conditions: Optional[list] = None
    ) -> bool:
        """
        Salva dados de saúde coletados durante a triagem no perfil do usuário.
        
        Usa o endpoint /api/onboard/external para salvar alergias, medicamentos
        e condições crônicas coletadas durante a conversa com a IA.
        
        Args:
            user_id: ID do usuário (UUID do PostgreSQL)
            allergies: String com alergias separadas por vírgula
            medications: Lista de nomes de medicamentos
            chronic_conditions: Lista de nomes de condições crônicas
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        if not self.enabled:
            logger.debug("ℹ️ Integração Trya desabilitada, pulando salvamento de dados de saúde")
            return False
        
        # Verifica se há algo para salvar
        has_allergies = allergies and allergies.strip()
        has_medications = medications and len(medications) > 0
        has_conditions = chronic_conditions and len(chronic_conditions) > 0
        
        if not has_allergies and not has_medications and not has_conditions:
            logger.debug("ℹ️ Nenhum dado de saúde para salvar")
            return False
        
        try:
            # Monta payload
            payload: Dict[str, Any] = {
                "userId": user_id
            }
            
            if has_allergies:
                payload["allergies"] = allergies.strip()
            
            if has_medications:
                # Remove duplicatas e strings vazias
                payload["medications"] = list(set(m.strip() for m in medications if m and m.strip()))
            
            if has_conditions:
                # Remove duplicatas e strings vazias
                payload["chronicConditions"] = list(set(c.strip() for c in chronic_conditions if c and c.strip()))
            
            # Headers com autenticação
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            }
            
            # Endpoint de atualização de dados de saúde (suporta merge com dados existentes)
            endpoint = f"{self.base_url}/api/onboard/health-data"
            
            logger.info(f"📤 Salvando dados de saúde coletados: {endpoint}")
            logger.debug(f"Payload: user_id={user_id}, allergies={has_allergies}, meds={len(medications) if medications else 0}, conditions={len(chronic_conditions) if chronic_conditions else 0}")
            
            # Envia requisição PUT (endpoint de update suporta merge com dados existentes)
            response = requests.put(
                endpoint,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            # 204 No Content é sucesso
            if response.status_code == 204:
                logger.info(f"✅ Dados de saúde salvos com sucesso para usuário {user_id}")
                return True
            else:
                response.raise_for_status()
                return True
                
        except requests.exceptions.Timeout:
            logger.error(f"❌ Timeout ao salvar dados de saúde")
            return False
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro ao salvar dados de saúde: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.status_code} - {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"❌ Erro inesperado ao salvar dados de saúde: {str(e)}")
            return False