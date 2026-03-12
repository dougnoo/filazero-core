# 🔧 Guia de Troubleshooting - Trya Backend

Este documento contém soluções para problemas comuns encontrados no desenvolvimento.

## Índice
- [Erros de Foreign Key](#erros-de-foreign-key)
- [Erros de Seeds](#erros-de-seeds)
- [Erros de Migrations](#erros-de-migrations)
- [Erros de Cognito](#erros-de-cognito)

---

## Erros de Foreign Key

### ❌ `violates foreign key constraint "FK_USERS_TENANT"`

**Erro completo:**
```
QueryFailedError: insert or update on table "users" violates foreign key constraint "FK_USERS_TENANT"
```

**Causa:**
Tentativa de criar um usuário com um `tenantId` que não existe na tabela `tenants`.

**Solução:**

1. **Execute a seed de tenants:**
```bash
npm run seed:tenants
```

2. **Use um dos tenantId válidos ao criar usuários:**
   - `550e8400-e29b-41d4-a716-446655440000` - Hospital Demo
   - `550e8400-e29b-41d4-a716-446655440001` - Clínica Saúde
   - `550e8400-e29b-41d4-a716-446655440002` - Laboratório Vida

3. **Exemplo de criação de beneficiário:**
```json
{
  "email": "usuario@exemplo.com",
  "name": "João Silva",
  "cpf": "12345678900",
  "birthDate": "1990-01-01",
  "phoneNumber": "+5511999999999",
  "planId": "58cfea4b-a5d9-4507-9f01-263cd7243fa2",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Verificar se o tenant existe:**
```sql
SELECT * FROM tenants WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

### ❌ `violates foreign key constraint "FK_USERS_PLAN"`

**Causa:**
O `planId` fornecido não existe na tabela `health_plans`.

**Solução:**
```bash
npm run seed:initial-config
```

Ou use o planId válido:
- `58cfea4b-a5d9-4507-9f01-263cd7243fa2` - Empresarial QC (Amil)

---

## Erros de Seeds

### ❌ Erro ao executar seed

**Problema:**
```
Error: Cannot find module 'tsconfig-paths/register'
```

**Solução:**
```bash
npm install
```

---

### ⚠️ Ordem de execução das seeds

**Problema:** Seeds falhando por dependências não satisfeitas.

**Solução:** Execute sempre nesta ordem:

```bash
# 1. Tenants (PRIMEIRO!)
npm run seed:tenants

# 2. Condições crônicas (opcional)
npm run seed:chronic-conditions

# 3. Medicamentos (opcional)
npm run seed:medications

# 4. Configuração inicial
npm run seed:initial-config

# OU execute todas de uma vez:
npm run seed:all
```

---

## Erros de Migrations

### ❌ Migration não foi executada

**Sintomas:**
- Tabelas não existem
- Colunas faltando
- Foreign keys não criadas

**Verificar status:**
```bash
# Ver migrations executadas
npm run typeorm:migration:show

# Executar migrations pendentes
npm run typeorm:migration:run
```

---

### ❌ Reverter migration

```bash
npm run typeorm:migration:revert
```

---

### ❌ Estado inconsistente do banco

**Solução drástica (⚠️ perde todos os dados):**
```bash
# 1. Dropar o banco
DROP DATABASE trya_db;

# 2. Criar novamente
CREATE DATABASE trya_db;

# 3. Executar migrations
npm run typeorm:migration:run

# 4. Executar seeds
npm run seed:all
```

---

## Erros de Cognito

### ❌ Usuário criado no Cognito mas não no banco

**Sintomas:**
Após erro de foreign key, o sistema faz rollback do Cognito, mas pode falhar.

**Solução manual:**

1. **Verificar o log de erro:**
```
ERRO CRÍTICO: Falha ao fazer rollback do Cognito
Ação necessária: Remover manualmente o usuário do Cognito:
  email: usuario@exemplo.com
  cognitoId: xxx
  username: xxx
```

2. **Remover do Cognito via AWS Console:**
   - Acesse AWS Cognito
   - Selecione o User Pool
   - Busque pelo email/username
   - Delete o usuário

3. **Ou use AWS CLI:**
```bash
aws cognito-idp admin-delete-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username "usuario@exemplo.com"
```

---

### ❌ `User already exists`

**Causa:**
Tentativa de criar usuário que já existe no Cognito ou no banco.

**Solução:**

1. **Verificar no banco:**
```sql
SELECT * FROM users WHERE email = 'usuario@exemplo.com';
SELECT * FROM users WHERE cpf = '12345678900';
```

2. **Se existir apenas no Cognito:**
   - Remova manualmente do Cognito (veja acima)
   - Tente novamente

---

## Erros de Validação

### ❌ `CPF já cadastrado no sistema`

**Causa:**
CPF duplicado no banco de dados.

**Solução:**
Use um CPF diferente ou remova o registro existente:
```sql
DELETE FROM users WHERE cpf = '12345678900';
```

---

### ❌ `Email já cadastrado no sistema`

**Solução:**
```sql
DELETE FROM users WHERE email = 'usuario@exemplo.com';
```

E também remova do Cognito (veja seção de Cognito acima).

---

## Erros de Conexão

### ❌ Não consegue conectar ao PostgreSQL

**Verificar:**
1. PostgreSQL está rodando?
2. Credenciais no `.env` estão corretas?
3. O banco `trya_db` existe?

**Testar conexão:**
```bash
psql -h localhost -U postgres -d trya_db
```

---

## Logs e Debug

### Ativar logs detalhados do TypeORM

No arquivo `.env`:
```env
TYPEORM_LOGGING=true
```

### Ver logs do NestJS

```bash
npm run start:dev
```

---

## Comandos Úteis

### Verificar estrutura do banco
```sql
-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d users

-- Ver foreign keys
\d+ users

-- Contar registros
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
```

### Limpar dados mantendo estrutura
```sql
TRUNCATE users CASCADE;
TRUNCATE tenants CASCADE;
-- etc...
```

---

## Precisa de mais ajuda?

1. Verifique os logs no console
2. Procure por mensagens de erro específicas
3. Consulte a documentação do NestJS
4. Verifique o README.md do projeto

---

**Última atualização:** 04/11/2025

