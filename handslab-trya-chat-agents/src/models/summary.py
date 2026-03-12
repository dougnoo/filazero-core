"""
Modelos Pydantic para saídas estruturadas.
"""
from pydantic import BaseModel, Field
from typing import List


class MedicalSummary(BaseModel):
    """
    Modelo de dados para o resumo médico a ser apresentado ao doutor.
    """
    conversation_summary: str = Field(
        description="Um resumo conciso de toda a conversa entre o agente e o paciente."
    )
    main_symptoms: List[str] = Field(
        description="Uma lista dos principais sintomas relatados pelo paciente."
    )
    chief_complaint: str = Field(
        description="A queixa principal do paciente, em suas próprias palavras ou de forma resumida."
    )
    suggested_exams: List[str] = Field(
        description="Uma lista de exames sugeridos com base nos sintomas e na conversa, se aplicável."
    )
    care_level: str = Field(
        description="Nível de cuidado recomendado: EMERGENCY_SAMU (ligar 192), EMERGENCY_HOSPITAL (ir direto ao hospital), TELEMEDICINE (consulta online), IN_PERSON (consulta presencial na rede)"
    )
    urgency_level: str = Field(
        description="Nível de urgência: EMERGENCY (risco de vida), VERY_URGENT (urgência), URGENT (urgente), STANDARD (pode agendar consulta normal), NON_URGENT (orientações)"
    )
    care_recommendation: str = Field(
        description="Recomendação de onde buscar atendimento: Hospital/Emergência, UPA, Clínico Geral, ou Orientações de Cuidado Domiciliar"
    )
    basic_care_instructions: List[str] = Field(
        description="Lista de orientações básicas de cuidado que o paciente pode seguir enquanto aguarda atendimento ou para alívio dos sintomas"
    )
