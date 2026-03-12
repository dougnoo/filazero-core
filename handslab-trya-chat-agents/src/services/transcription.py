"""
Serviço de transcrição de áudio usando Amazon Transcribe.
"""
import logging
import boto3
import uuid
import time
import base64
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class TranscriptionService:
    """
    Serviço para transcrever áudios usando Amazon Transcribe.
    Suporta áudios em base64 ou URLs S3.
    """

    def __init__(self, s3_bucket: Optional[str] = None, region: str = "us-east-1"):
        """
        Inicializa o serviço de transcrição.
        
        Args:
            s3_bucket: Nome do bucket S3 para upload temporário de áudios
            region: Região AWS para os serviços
        """
        self.transcribe_client = boto3.client('transcribe', region_name=region)
        self.s3_client = boto3.client('s3', region_name=region)
        self.s3_bucket = s3_bucket or f"medical-triage-audio-{uuid.uuid4().hex[:8]}"
        self.region = region
        
        # Cria bucket se não existir
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Garante que o bucket S3 existe."""
        try:
            self.s3_client.head_bucket(Bucket=self.s3_bucket)
            logger.info(f"✅ Bucket S3 '{self.s3_bucket}' já existe")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                try:
                    if self.region == 'us-east-1':
                        self.s3_client.create_bucket(Bucket=self.s3_bucket)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.s3_bucket,
                            CreateBucketConfiguration={'LocationConstraint': self.region}
                        )
                    logger.info(f"✅ Bucket S3 '{self.s3_bucket}' criado com sucesso")
                    
                    # Configura lifecycle para deletar áudios após 1 dia
                    self.s3_client.put_bucket_lifecycle_configuration(
                        Bucket=self.s3_bucket,
                        LifecycleConfiguration={
                            'Rules': [{
                                'ID': 'DeleteAudioAfter1Day',
                                'Status': 'Enabled',
                                'Prefix': '',
                                'Expiration': {'Days': 1}
                            }]
                        }
                    )
                    logger.info(f"✅ Lifecycle policy configurada (delete após 1 dia)")
                except Exception as create_error:
                    logger.error(f"❌ Erro ao criar bucket: {create_error}")
                    raise
            else:
                logger.error(f"❌ Erro ao verificar bucket: {e}")
                raise

    def transcribe_audio(
        self, 
        audio_data: str, 
        audio_format: str = "mp3",
        language_code: str = "pt-BR"
    ) -> str:
        """
        Transcreve um áudio em base64 para texto.
        
        Args:
            audio_data: Áudio em base64 ou URL S3
            audio_format: Formato do áudio (mp3, wav, ogg, flac, etc)
            language_code: Código do idioma (pt-BR por padrão)
            
        Returns:
            Texto transcrito
        """
        # Detecta se é base64 ou URL
        if audio_data.startswith('s3://') or audio_data.startswith('https://'):
            s3_uri = audio_data if audio_data.startswith('s3://') else self._https_to_s3_uri(audio_data)
        else:
            # Faz upload do áudio base64 para S3
            s3_uri = self._upload_audio_to_s3(audio_data, audio_format)
        
        # Inicia job de transcrição
        job_name = f"transcription-{uuid.uuid4().hex}"
        
        logger.info(f"🎙️ Iniciando transcrição: job={job_name}, uri={s3_uri}")
        
        try:
            self.transcribe_client.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={'MediaFileUri': s3_uri},
                MediaFormat=audio_format,
                LanguageCode=language_code
            )
            
            # Aguarda conclusão
            transcript_text = self._wait_for_transcription(job_name)
            
            logger.info(f"✅ Transcrição concluída: '{transcript_text[:100]}...'")
            return transcript_text
            
        except Exception as e:
            logger.error(f"❌ Erro na transcrição: {e}")
            raise
        finally:
            # Cleanup: deleta job de transcrição
            try:
                self.transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)
            except Exception:
                pass

    def _upload_audio_to_s3(self, audio_base64: str, audio_format: str) -> str:
        """
        Faz upload de áudio base64 para S3.
        
        Args:
            audio_base64: Áudio codificado em base64
            audio_format: Formato do arquivo
            
        Returns:
            URI S3 do arquivo
        """
        try:
            # Decodifica base64
            audio_bytes = base64.b64decode(audio_base64)
            
            # Gera nome único para o arquivo
            file_key = f"audio/{uuid.uuid4().hex}.{audio_format}"
            
            # Upload para S3
            logger.info(f"⬆️ Fazendo upload de áudio para S3: {file_key}")
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=file_key,
                Body=audio_bytes,
                ContentType=f"audio/{audio_format}"
            )
            
            s3_uri = f"s3://{self.s3_bucket}/{file_key}"
            logger.info(f"✅ Upload concluído: {s3_uri}")
            return s3_uri
            
        except Exception as e:
            logger.error(f"❌ Erro no upload para S3: {e}")
            raise

    def _wait_for_transcription(self, job_name: str, max_wait: int = 60) -> str:
        """
        Aguarda a conclusão de um job de transcrição.
        
        Args:
            job_name: Nome do job de transcrição
            max_wait: Tempo máximo de espera em segundos
            
        Returns:
            Texto transcrito
        """
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            try:
                response = self.transcribe_client.get_transcription_job(
                    TranscriptionJobName=job_name
                )
                
                status = response['TranscriptionJob']['TranscriptionJobStatus']
                
                if status == 'COMPLETED':
                    # Obtém o texto transcrito
                    transcript_uri = response['TranscriptionJob']['Transcript']['TranscriptFileUri']
                    return self._fetch_transcript(transcript_uri)
                    
                elif status == 'FAILED':
                    failure_reason = response['TranscriptionJob'].get('FailureReason', 'Unknown')
                    raise Exception(f"Transcrição falhou: {failure_reason}")
                
                # Aguarda antes de verificar novamente
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Erro ao verificar status da transcrição: {e}")
                raise
        
        raise TimeoutError(f"Transcrição não concluída em {max_wait} segundos")

    def _fetch_transcript(self, transcript_uri: str) -> str:
        """
        Busca o texto transcrito a partir da URI.
        
        Args:
            transcript_uri: URI do arquivo de transcrição
            
        Returns:
            Texto transcrito
        """
        import json
        import urllib.request
        
        try:
            with urllib.request.urlopen(transcript_uri) as response:
                data = json.loads(response.read().decode())
                transcript = data['results']['transcripts'][0]['transcript']
                return transcript.strip()
        except Exception as e:
            logger.error(f"❌ Erro ao buscar transcrição: {e}")
            raise

    def _https_to_s3_uri(self, https_url: str) -> str:
        """Converte URL HTTPS S3 para URI s3://"""
        # Exemplo: https://bucket.s3.region.amazonaws.com/key -> s3://bucket/key
        import re
        match = re.search(r'https://([^.]+)\.s3[^/]*amazonaws\.com/(.+)', https_url)
        if match:
            bucket, key = match.groups()
            return f"s3://{bucket}/{key}"
        return https_url


def transcribe_audio_message(
    audio_data: str,
    audio_format: str = "mp3",
    s3_bucket: Optional[str] = None
) -> str:
    """
    Função auxiliar para transcrever áudio rapidamente.
    
    Args:
        audio_data: Áudio em base64 ou URL S3
        audio_format: Formato do áudio
        s3_bucket: Bucket S3 (opcional)
        
    Returns:
        Texto transcrito
    """
    service = TranscriptionService(s3_bucket=s3_bucket)
    return service.transcribe_audio(audio_data, audio_format)
