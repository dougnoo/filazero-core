"""
Configuração centralizada de logging para Lambda.
"""
import logging
import sys


def setup_lambda_logging(level: int = logging.INFO) -> logging.Logger:
    """
    Configura logging otimizado para AWS Lambda.
    
    Args:
        level: Nível de logging (padrão: INFO)
        
    Returns:
        Logger raiz configurado
    """
    root_logger = logging.getLogger()
    
    # Lambda já tem handlers, apenas ajusta o nível
    if root_logger.hasHandlers():
        root_logger.setLevel(level)
    else:
        # Fallback para ambiente local
        logging.basicConfig(
            level=level,
            format='%(levelname)s - %(name)s - %(message)s',
            stream=sys.stdout,
            force=True
        )
    
    # Reduz verbosidade de bibliotecas externas
    logging.getLogger('boto3').setLevel(logging.WARNING)
    logging.getLogger('botocore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    return root_logger
