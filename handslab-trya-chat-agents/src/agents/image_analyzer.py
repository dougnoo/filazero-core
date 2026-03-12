"""
Agente Analisador de Imagens - Analisa imagens médicas, exames e documentos.
"""
import os
import logging
import boto3
import base64
import uuid
from datetime import datetime
from langchain_aws import ChatBedrockConverse
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from typing import Dict, Any, List, Optional

from ..utils.text_utils import remove_emojis

logger = logging.getLogger(__name__)

ANALYZER_PROMPT = """Você é um assistente de IA especializado em análise de imagens médicas e documentos relacionados à saúde.

Sua tarefa é analisar cuidadosamente as imagens fornecidas pelo paciente e extrair informações relevantes que auxiliarão o médico na triagem.

Tipos de imagens que você pode receber:
- Fotos de lesões, machucados, feridas, erupções cutâneas
- Resultados de exames laboratoriais (hemogramas, exames de sangue, etc.)
- Imagens de exames de imagem (raio-x, ultrassom, tomografia - quando disponível em foto)
- Prescrições médicas anteriores
- Documentos médicos (laudos, relatórios)

Sua resposta deve ter DUAS seções claramente separadas:

## RESPOSTA AO PACIENTE:
[Resposta curta e amigável de 3-4 linhas para o paciente, confirmando que viu a imagem, fazendo observação básica e dando 2-3 recomendações de cuidado. Use linguagem simples e tranquilizadora.

IMPORTANTE: SEMPRE termine sua resposta com UMA PERGUNTA para continuar a conversa, como:
- "Além disso, você está sentindo algum outro sintoma?"
- "Há quanto tempo você está com esse problema?"
- "Você já tomou algum medicamento para isso?"
- "Tem alguma outra coisa que gostaria de me contar sobre sua saúde?"
Escolha a pergunta mais relevante baseada no contexto da imagem e conversa.]

## ANÁLISE PARA O MÉDICO:
[Análise técnica e detalhada incluindo:
1. Descrição objetiva do que observa
2. Características relevantes (tamanho, cor, localização, aparência)
3. Dados extraídos de exames (se aplicável)
4. Contextualização com possíveis condições (SEM diagnósticos definitivos)
5. Alertas de urgência se houver]

IMPORTANTE:
- Mantenha as seções claramente separadas
- NÃO faça diagnósticos definitivos
- SEMPRE incentive consulta médica presencial
- SEMPRE termine a resposta ao paciente com uma pergunta de continuação

Histórico da conversa (contexto):
{conversation_history}

Agora analise a(s) imagem(ns) fornecida(s) seguindo EXATAMENTE o formato acima."""


class ImageAnalyzerAgent:
    """Agente que analisa imagens médicas e documentos."""

    def __init__(self, model_id: Optional[str] = None, temperature: float = 0.3):
        """
        Inicializa o agente analisador de imagens.
        
        Args:
            model_id: ID do modelo Bedrock (deve suportar visão)
            temperature: Temperatura para geração
        """
        if model_id is None:
            # Claude 3.5 Sonnet v2 tem melhor suporte a visão
            model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")

        from botocore.config import Config
        config = Config(
            retries={'max_attempts': 10, 'mode': 'adaptive'},
            read_timeout=300
        )

        self.llm = ChatBedrockConverse(
            model=model_id,
            temperature=temperature,
            config=config
        )
        self.prompt_template = ANALYZER_PROMPT
        self.s3_client = boto3.client('s3')
        self.bucket_name = os.getenv('BUCKET_NAME')
    
    def _upload_image_to_s3(self, image_data: Dict[str, Any], session_id: str, original_name: str = None) -> Dict[str, str]:
        """
        Faz upload da imagem para S3 e retorna informações do arquivo.
        
        Args:
            image_data: Dados da imagem (source com base64 ou URL)
            session_id: ID da sessão para organizar no S3
            original_name: Nome original do arquivo (opcional)
            
        Returns:
            Dict com 'original_name' e 's3_key'
        """
        try:
            # Gera nome único para o arquivo
            file_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Determina extensão baseado no tipo de imagem
            source = image_data.get('source', {})
            media_type = source.get('media_type', 'image/jpeg')
            extension = media_type.split('/')[-1] if '/' in media_type else 'jpg'
            
            # Chave no S3: images/{timestamp}_{file_id}.ext
            s3_filename = f"{timestamp}_{file_id}.{extension}"
            s3_key = f"images/{s3_filename}"
            
            # Obtém dados binários da imagem
            if 'data' in source:
                # Imagem em base64
                image_bytes = base64.b64decode(source['data'])
            elif 'url' in source:
                # Se for URL, por enquanto apenas registramos (não fazemos download)
                logger.warning(f"⚠️ Imagem por URL não será salva no S3: {source['url']}")
                return {"original_name": original_name or "url_image", "s3_key": s3_filename}
            else:
                logger.error("❌ Formato de imagem não suportado para upload")
                return {"original_name": original_name or "unknown", "s3_key": s3_filename}
            
            # Upload para S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=image_bytes,
                ContentType=media_type,
                Metadata={
                    'session_id': session_id,
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            logger.info(f"✅ Imagem salva no S3: s3://{self.bucket_name}/{s3_key}")
            return {"original_name": original_name or s3_filename, "s3_key": s3_filename}
            
        except Exception as e:
            logger.error(f"❌ Erro ao fazer upload da imagem para S3: {str(e)}")
            # Retorna informações de fallback mesmo em caso de erro
            error_filename = f"error_{uuid.uuid4()}.jpg"
            return {"original_name": original_name or error_filename, "s3_key": error_filename}

    def analyze_images(
        self, 
        images: List[Dict[str, Any]], 
        conversation_history: str = "",
        user_context: str = ""
    ) -> tuple[str, str]:
        """
        Analisa uma ou mais imagens médicas.
        
        Args:
            images: Lista de dicts com imagens. Formato:
                    [{"type": "image", "source": {"type": "base64", "data": "...", "media_type": "image/jpeg"}}]
                    ou
                    [{"type": "image", "source": {"type": "url", "url": "https://..."}}]
            conversation_history: Histórico da conversa para contexto
            user_context: Contexto adicional fornecido pelo usuário sobre as imagens
            
        Returns:
            Tupla (resposta_usuario, analise_medico)
        """
        logger.info(f"🖼️ Analisando {len(images)} imagem(ns)...")
        
        # Monta o prompt com contexto
        prompt_text = self.prompt_template.format(
            conversation_history=conversation_history or "Nenhum histórico anterior."
        )
        
        if user_context:
            prompt_text += f"\n\nContexto fornecido pelo paciente sobre as imagens:\n{user_context}"

        # Cria mensagem com texto e imagens
        content = [{"type": "text", "text": prompt_text}]
        
        # Adiciona as imagens ao conteúdo
        for img in images:
            content.append(img)

        try:
            # Invoca o modelo com visão
            messages = [HumanMessage(content=content)]
            response = self.llm.invoke(messages)
            
            full_analysis = response.content
            logger.info(f"✅ Análise concluída: {len(full_analysis)} caracteres")
            
            # Extrai as duas seções
            user_response = ""
            medical_analysis = ""
            
            if "## RESPOSTA AO PACIENTE:" in full_analysis and "## ANÁLISE PARA O MÉDICO:" in full_analysis:
                parts = full_analysis.split("## ANÁLISE PARA O MÉDICO:")
                user_part = parts[0].replace("## RESPOSTA AO PACIENTE:", "").strip()
                medical_part = parts[1].strip() if len(parts) > 1 else ""
                
                user_response = user_part
                medical_analysis = medical_part
            else:
                # Fallback: se não seguiu o formato, usa tudo como análise médica
                logger.warning("⚠️ Resposta não seguiu formato esperado, usando como análise médica")
                medical_analysis = full_analysis
                user_response = "Obrigado por compartilhar a imagem. Vou analisar e te dar algumas orientações. "
            
            return user_response, medical_analysis

        except Exception as e:
            logger.error(f"❌ Erro ao analisar imagens: {e}")
            error_msg = "Desculpe, houve um erro ao analisar as imagens. Por favor, tente novamente ou descreva o que aparece nas imagens."
            return error_msg, f"Erro técnico: {str(e)}"

    def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa o agente no contexto do LangGraph.
        
        Args:
            state: Estado atual do grafo
            
        Returns:
            Estado atualizado com análise das imagens
        """
        images = state.get("images", [])
        
        if not images:
            logger.warning("⚠️ ImageAnalyzerAgent chamado sem imagens - finalizando turno para evitar loop")
            # NÃO adicionar mensagem ao histórico para evitar confusão
            # Vai para END para finalizar o turno (CLI iniciará novo turno)
            state["next"] = "finish"
            return state

        # Extrai histórico da conversa
        messages = state.get("messages", [])
        conversation_history = "\n".join([
            f"{'Paciente' if isinstance(msg, HumanMessage) else 'Assistente'}: {msg.content[:200]}"
            for msg in messages[-5:]  # Últimas 5 mensagens
        ])

        # Contexto sobre as imagens (se fornecido pelo usuário)
        image_context = state.get("image_context", "")

        # Analisa imagens (retorna resposta para usuário E análise para médico)
        user_response, detailed_analysis = self.analyze_images(images, conversation_history, image_context)

        # Remove emojis da resposta ao usuário
        clean_user_response = remove_emojis(user_response)
        
        # Adiciona resposta simplificada ao histórico (o que o usuário vê)
        ai_msg = AIMessage(content=f"Imagem analisada: {clean_user_response}")
        ai_msg.additional_kwargs["timestamp"] = datetime.now().isoformat()
        state["messages"].append(ai_msg)

        # Faz upload das imagens para S3 e obtém informações dos arquivos
        session_id = state.get("session_id", "unknown")
        uploaded_files = []
        for idx, img in enumerate(images):
            original_name = img.get("original_name") or f"image_{idx+1}"
            file_info = self._upload_image_to_s3(img, session_id, original_name)
            uploaded_files.append(file_info)
        
        logger.info(f"📦 {len(uploaded_files)} imagem(ns) salva(s) no S3")

        # Armazena análise DETALHADA separadamente para o médico
        patient_data = state.get("patient_data", {})
        if "image_analyses" not in patient_data:
            patient_data["image_analyses"] = []
        
        patient_data["image_analyses"].append({
            "timestamp": datetime.now().isoformat(),
            "num_images": len(images),
            "context": image_context,
            "user_response": user_response,  # Resposta simplificada mostrada ao usuário
            "detailed_analysis": detailed_analysis  # Análise completa para o médico
        })
        
        # Adiciona lista de anexos ao patient_data (para consulta rápida)
        if "attachments" not in patient_data:
            patient_data["attachments"] = []
        patient_data["attachments"].extend(uploaded_files)
        
        state["patient_data"] = patient_data

        # Limpa imagens após análise (evitar reprocessamento)
        state["images"] = []
        state["image_context"] = ""

        # Retorna ao supervisor para continuar triagem
        state["next"] = "supervisor"
        
        return state


def create_image_analyzer_agent(model_id: Optional[str] = None) -> ImageAnalyzerAgent:
    """
    Factory function para criar o agente analisador de imagens.
    
    Args:
        model_id: ID do modelo Bedrock (opcional)
        
    Returns:
        Instância do ImageAnalyzerAgent
    """
    return ImageAnalyzerAgent(model_id=model_id)
