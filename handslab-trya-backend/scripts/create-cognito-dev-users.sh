#!/bin/bash
# ==============================================================================
# Script para criar usuários de desenvolvimento no AWS Cognito
# ==============================================================================
#
# USO: ./scripts/create-cognito-dev-users.sh
#
# REQUISITOS:
#   - AWS CLI configurado com credenciais
#   - Variável de ambiente COGNITO_USER_POOL_ID definida
#
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
USER_POOL_ID="${COGNITO_USER_POOL_ID}"
TEMP_PASSWORD="Trya@Temp123"
PERMANENT_PASSWORD="Trya@2024!"

if [ -z "$USER_POOL_ID" ]; then
  echo -e "${RED}❌ Erro: COGNITO_USER_POOL_ID não está definido${NC}"
  echo "   Execute: export COGNITO_USER_POOL_ID=<seu-user-pool-id>"
  exit 1
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}   Criando Usuários de Desenvolvimento no AWS Cognito${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "User Pool ID: ${YELLOW}$USER_POOL_ID${NC}"
echo ""

# Função para criar usuário
create_user() {
  local EMAIL=$1
  local NAME=$2
  local GROUP=$3

  echo -e "${BLUE}📧 Criando usuário: $EMAIL${NC}"

  # Cria o usuário
  aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes \
      Name=email,Value="$EMAIL" \
      Name=email_verified,Value=true \
      Name=name,Value="$NAME" \
      Name=custom:role,Value="$GROUP" \
    --temporary-password "$TEMP_PASSWORD" \
    --message-action SUPPRESS \
    2>/dev/null || echo -e "${YELLOW}   ⚠️  Usuário já existe${NC}"

  # Define senha permanente
  aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --password "$PERMANENT_PASSWORD" \
    --permanent \
    2>/dev/null || true

  # Adiciona ao grupo
  aws cognito-idp admin-add-user-to-group \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --group-name "$GROUP" \
    2>/dev/null || echo -e "${YELLOW}   ⚠️  Grupo $GROUP não existe ou usuário já está no grupo${NC}"

  echo -e "${GREEN}   ✅ $EMAIL -> Grupo: $GROUP${NC}"
}

# Verifica se os grupos existem
echo -e "${BLUE}📂 Verificando grupos...${NC}"
for GROUP in SUPER_ADMIN ADMIN DOCTOR HR BENEFICIARY; do
  aws cognito-idp get-group \
    --user-pool-id "$USER_POOL_ID" \
    --group-name "$GROUP" \
    2>/dev/null || {
      echo -e "${YELLOW}   Criando grupo $GROUP...${NC}"
      aws cognito-idp create-group \
        --user-pool-id "$USER_POOL_ID" \
        --group-name "$GROUP" \
        --description "Grupo para usuários $GROUP"
    }
done
echo ""

# ==================== CRIAR USUÁRIOS ====================
echo -e "${BLUE}👤 Criando usuários...${NC}"
echo ""

# SUPER_ADMIN
create_user "superadmin.dev@trya.com" "Super Admin Dev" "SUPER_ADMIN"

# GRUPO TRIGO
echo ""
echo -e "${YELLOW}--- Grupo Trigo ---${NC}"
create_user "admin.trigo@trya.com" "Admin Grupo Trigo" "ADMIN"
create_user "medico.trigo@trya.com" "Dr. João Silva (Trigo)" "DOCTOR"
create_user "rh.trigo@trya.com" "Maria RH Grupo Trigo" "HR"
create_user "beneficiario.trigo@trya.com" "Ana Beneficiária Trigo" "BENEFICIARY"

# CLÍNICA SAÚDE
echo ""
echo -e "${YELLOW}--- Clínica Saúde ---${NC}"
create_user "admin.clinica@trya.com" "Admin Clínica Saúde" "ADMIN"
create_user "medico.clinica@trya.com" "Dra. Paula Santos (Clínica)" "DOCTOR"
create_user "rh.clinica@trya.com" "Carlos RH Clínica" "HR"
create_user "beneficiario.clinica@trya.com" "Pedro Beneficiário Clínica" "BENEFICIARY"

# LABORATÓRIO VIDA
echo ""
echo -e "${YELLOW}--- Laboratório Vida ---${NC}"
create_user "admin.lab@trya.com" "Admin Laboratório Vida" "ADMIN"
create_user "medico.lab@trya.com" "Dr. Roberto Lima (Lab)" "DOCTOR"
create_user "rh.lab@trya.com" "Fernanda RH Lab" "HR"
create_user "beneficiario.lab@trya.com" "Lucas Beneficiário Lab" "BENEFICIARY"

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}   ✅ Usuários criados com sucesso!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "🔑 Senha para todos os usuários: ${YELLOW}$PERMANENT_PASSWORD${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "   1. Execute o seed no banco de dados:"
echo "      pnpm run seed:dev-users"
echo ""
echo "   2. Atualize o cognito_id no banco com o Sub de cada usuário:"
echo "      Isso será feito automaticamente no primeiro login"
echo ""
