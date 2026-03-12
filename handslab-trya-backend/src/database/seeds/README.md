# Seeds do Banco de Dados

Este diretório contém as seeds para popular o banco de dados com dados iniciais e de teste.

## 📋 Seeds Disponíveis

### 1. Tenants (`seed:tenants`)
**IMPORTANTE**: Execute esta seed primeiro antes de criar usuários!

Cria os tenants (organizações) no sistema. Os usuários devem pertencer a um tenant válido.

```bash
npm run seed:tenants
```

**Tenants criados:**
- `550e8400-e29b-41d4-a716-446655440000` - Hospital Demo
- `550e8400-e29b-41d4-a716-446655440001` - Clínica Saúde
- `550e8400-e29b-41d4-a716-446655440002` - Laboratório Vida

### 2. Condições Crônicas (`seed:chronic-conditions`)
Popula a tabela de condições crônicas (doenças).

```bash
npm run seed:chronic-conditions
```

### 3. Medicamentos (`seed:medications`)
Popula a tabela de medicamentos de uso contínuo no Brasil.

```bash
npm run seed:medications
```

### 4. Configuração Inicial (`seed:initial-config`)
Cria dados de exemplo incluindo:
- Tenant padrão (Grupo Trigo)
- Corretora (Grupo Trigo)
- Operadora de saúde (Amil)
- Plano de saúde (Empresarial QC)
- Usuário de exemplo

```bash
npm run seed:initial-config
```

### 5. Tutorials (`seed:tutorials`)
Cria tutoriais de onboarding para cada tenant (Bem-vindo, Complete seu Perfil, Agende Consultas).

```bash
npm run seed:tutorials
```

### 6. Usuários de Desenvolvimento (`seed:dev-users`)
Cria usuários de teste por role e tenant (Admin, médico, RH, beneficiário).
Beneficiários recebem plano de saúde e alguns têm onboarded_at para simular fluxos.

```bash
npm run seed:dev-users
```

## 🚀 Executar Todas as Seeds

Para executar todas as seeds em ordem:

```bash
npm run seed:all
```

Esta é a forma recomendada, pois garante a ordem correta de execução.

## 📝 Ordem de Execução Recomendada

Se precisar executar seeds individualmente:

1. `npm run seed:tenants` ← **OBRIGATÓRIO PRIMEIRO**
2. `npm run seed:chronic-conditions`
3. `npm run seed:medications`
4. `npm run seed:health-operators`
5. `npm run seed:health-plans`
6. `npm run seed:initial-config`
7. `npm run seed:tutorials`
8. `npm run seed:dev-users`

## ⚠️ Problemas Comuns

### Erro: `violates foreign key constraint "FK_USERS_TENANT"`

**Causa**: Tentativa de criar usuário sem tenant válido no banco.

**Solução**:
```bash
npm run seed:tenants
```

Depois tente criar o usuário novamente, garantindo que está usando um dos `tenantId` válidos:
- `550e8400-e29b-41d4-a716-446655440000` (Hospital Demo)
- `550e8400-e29b-41d4-a716-446655440001` (Clínica Saúde)
- `550e8400-e29b-41d4-a716-446655440002` (Laboratório Vida)

## 🔄 Re-executar Seeds

Todas as seeds usam `ON CONFLICT` com `DO UPDATE` ou `DO NOTHING`, então são seguras para re-executar:
- Não duplicam dados
- Atualizam registros existentes quando apropriado

## 🛠️ Criar Nova Seed

1. Crie um arquivo `seed-nome.ts` neste diretório
2. Use o template das seeds existentes
3. Adicione o script no `package.json`:

```json
{
  "scripts": {
    "seed:nome": "ts-node -r tsconfig-paths/register src/database/seeds/seed-nome.ts"
  }
}
```

4. Atualize a ordem em `seed:all` se necessário

## 📚 Mais Informações

- As seeds usam TypeORM com QueryRunner para transações
- Em caso de erro, o rollback é automático
- Logs detalhados são exibidos no console

