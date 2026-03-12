#!/bin/bash
# =============================================================================
# Script de Limpeza - Recursos Bedrock Não Utilizados
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROFILE="trya-local"
REGION="us-east-1"

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     LIMPEZA DE RECURSOS BEDROCK NÃO UTILIZADOS                ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirmar
echo -e "${RED}⚠️  ATENÇÃO: Este script irá deletar recursos Bedrock!${NC}"
echo ""
echo "Recursos a serem deletados:"
echo "  • 5 Bedrock Agents (não usados no código)"
echo "  • 1 Knowledge Base (7KTA2UELTC - não usado no código)"
echo ""
read -p "Deseja continuar? (digite 'SIM' para confirmar): " -r
echo

if [[ ! $REPLY == "SIM" ]]; then
    echo "Cancelado."
    exit 1
fi

echo ""
echo -e "${YELLOW}Deletando Bedrock Agents...${NC}"
echo ""

# Deletar Agents
AGENTS=(
    "RXEHLWCMCG:agente-rede-de-atendimento"
    "JACBTWEWA0:agente-triagem"
    "15JIUMMLCT:AgentLocalizacao"
    "CUMRFQXCGF:AgentSupervisor"
    "XDW13NDLUP:AgentTriagem"
)

for AGENT in "${AGENTS[@]}"; do
    AGENT_ID="${AGENT%%:*}"
    AGENT_NAME="${AGENT##*:}"
    
    echo "Deletando: $AGENT_NAME ($AGENT_ID)"
    
    if aws bedrock-agent delete-agent \
        --agent-id "$AGENT_ID" \
        --region "$REGION" \
        --profile "$PROFILE" \
        --skip-resource-in-use-check 2>/dev/null; then
        echo -e "${GREEN}✓ Deletado${NC}"
    else
        echo -e "${RED}✗ Erro ao deletar (pode já estar deletado)${NC}"
    fi
    echo ""
done

echo ""
echo -e "${YELLOW}Deletando Knowledge Base...${NC}"
echo ""

KB_ID="7KTA2UELTC"
KB_NAME="triagem-saude-kb-hml"

echo "Deletando: $KB_NAME ($KB_ID)"

if aws bedrock-agent delete-knowledge-base \
    --knowledge-base-id "$KB_ID" \
    --region "$REGION" \
    --profile "$PROFILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Deletado${NC}"
else
    echo -e "${RED}✗ Erro ao deletar (pode já estar deletado ou em uso)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    LIMPEZA CONCLUÍDA                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Verificar se recursos foram deletados:"
echo "     aws bedrock-agent list-agents --region $REGION --profile $PROFILE"
echo ""
echo "  2. Atualizar samconfig.toml do chat-agents:"
echo "     • Remover ou atualizar KnowledgeBaseId"
echo ""
