"""
Workflow de triagem de saúde usando LangGraph.
"""
from langgraph.graph import StateGraph, END
from typing import Dict, Any, cast
import logging

from ..models.state import State
from ..agents.supervisor import SupervisorAgent
from ..agents.data_collector import DataCollectorAgent
from ..agents.image_analyzer import ImageAnalyzerAgent
from ..agents.summarizer import SummarizerAgent
from ..agents.onboarding import OnboardingAgent

logger = logging.getLogger(__name__)


def create_workflow() -> StateGraph:
    """
    Cria o workflow de triagem de saúde.
    
    Returns:
        Grafo de estado configurado
    """
    # Inicializa agentes
    supervisor = SupervisorAgent()
    data_collector = DataCollectorAgent()
    image_analyzer = ImageAnalyzerAgent()
    summarizer = SummarizerAgent()
    onboarding = OnboardingAgent()
    
    # Define funções dos nós
    def supervisor_node(state: State) -> Dict[str, Any]:
        """Nó do supervisor."""
        return supervisor.route(cast(Dict[str, Any], state))
    
    def data_collector_node(state: State) -> Dict[str, Any]:
        """Nó do coletor de dados."""
        # Executa uma única interação de coleta de dados
        # Não force o término aqui; permita múltiplas interações no CLI
        return data_collector.collect(cast(Dict[str, Any], state))
    
    def image_analyzer_node(state: State) -> Dict[str, Any]:
        """Nó do analisador de imagens."""
        return image_analyzer(cast(Dict[str, Any], state))
    
    def summarizer_node(state: State) -> Dict[str, Any]:
        """Nó do resumidor."""
        return summarizer.summarize(cast(Dict[str, Any], state))
    
    def onboarding_node(state: State) -> Dict[str, Any]:
        """Nó do onboarding."""
        return onboarding.collect(cast(Dict[str, Any], state))
    
    def should_continue(state: State) -> str:
        """
        Determina se deve continuar ou finalizar.
        
        Args:
            state: Estado atual
            
        Returns:
            Nome do próximo nó ou END
        """
        next_agent = state.get("next", "").lower()
        
        logger.info(f"🔀 Decisão do supervisor: próximo = '{next_agent}'")
        
        if next_agent == "finish" or state.get("is_complete", False):
            logger.info("🏁 Finalizando workflow")
            return END
        elif next_agent == "supervisor":
            logger.info("➡️  Indo para Supervisor")
            return "supervisor"
        elif next_agent == "image_analyzer":
            logger.info("➡️  Indo para Image Analyzer")
            return "image_analyzer"
        elif next_agent == "data_collector":
            logger.info("➡️  Indo para Data Collector")
            return "data_collector"
        elif next_agent == "summarizer":
            logger.info("➡️  Indo para Summarizer")
            return "summarizer"
        elif next_agent == "onboarding":
            logger.info("➡️  Indo para Onboarding")
            return "onboarding"
        else:
            # Se o supervisor não decidir claramente, finaliza o turno
            logger.warning(f"⚠️  Próximo agente indefinido ('{next_agent}'), finalizando turno")
            return END
    
    # Cria o grafo
    workflow = StateGraph(State)
    
    # Adiciona nós
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("image_analyzer", image_analyzer_node)
    workflow.add_node("data_collector", data_collector_node)
    workflow.add_node("summarizer", summarizer_node)
    workflow.add_node("onboarding", onboarding_node)
    
    # Define ponto de entrada
    workflow.set_entry_point("supervisor")
    
    # Adiciona arestas condicionais
    workflow.add_conditional_edges(
        "supervisor",
        should_continue,
        {
            "supervisor": "supervisor",
            "image_analyzer": "image_analyzer",
            "data_collector": "data_collector",
            "summarizer": "summarizer",
            "onboarding": "onboarding",
            END: END
        }
    )
    
    # Image analyzer usa lógica condicional (pode ir para supervisor ou data_collector)
    workflow.add_conditional_edges(
        "image_analyzer",
        should_continue,
        {
            "supervisor": "supervisor",
            "data_collector": "data_collector",
            "summarizer": "summarizer",
            END: END
        }
    )
    
    # Data collector vai para END (CLI controla próximo turno)
    workflow.add_edge("data_collector", END)
    
    # Onboarding vai para END (aguarda resposta do usuário)
    workflow.add_edge("onboarding", END)
    
    # Summarizer vai para o END (finaliza)
    workflow.add_edge("summarizer", END)
    
    return workflow
    
    return workflow


def compile_workflow() -> Any:
    """
    Compila o workflow para execução.
    
    Returns:
        Workflow compilado
    """
    workflow = create_workflow()
    return workflow.compile()
