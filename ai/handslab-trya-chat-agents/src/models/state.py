"""
Modelos de estado para o workflow de triagem de saúde.
"""
from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph import add_messages


class State(TypedDict):
    """Estado compartilhado entre os agentes."""
    
    # Histórico de mensagens da conversa
    messages: Annotated[list, add_messages]
    
    # Próximo agente a ser executado
    next: str
    
    # Dados coletados do paciente
    patient_data: dict
    
    # Imagens para análise (base64 ou URLs)
    images: list
    
    # Contexto sobre as imagens fornecido pelo usuário
    image_context: str

    # Resumo médico para o doutor
    medical_summary: Optional[dict]
    
    # Flag para indicar se a triagem está completa
    is_complete: bool


# Tipos de agentes disponíveis
AgentType = Literal["supervisor", "data_collector", "image_analyzer", "summarizer", "FINISH"]
