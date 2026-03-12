# Health Operators Module

## 📋 Descrição

Módulo responsável pela gestão de operadoras de plano de saúde no sistema.

## 🏗️ Arquitetura

Este módulo segue Clean Architecture com as seguintes camadas:

```
health-operators/
├── presentation/              # Camada de apresentação
│   ├── controllers/
│   │   └── health-operators.controller.ts
│   └── dtos/
│       └── list-health-operators.query.dto.ts
├── application/              # Camada de aplicação
│   └── use-cases/
│       └── list-health-operators.use-case.ts
├── domain/                   # Camada de domínio
│   └── repositories/
│       └── health-operators.repository.ts
├── infrastructure/           # Camada de infraestrutura
│   └── typeorm/
│       └── repositories/
│           └── health-operators.repository.ts
└── health-operators.module.ts
```

## 🔗 Endpoint

```
GET /api/health-operators
```

## 🔐 Autenticação

Requer token JWT válido via header `Authorization: Bearer <token>`

## 📥 Parâmetros de Query (Opcionais)

| Parâmetro | Tipo   | Descrição                                      | Exemplo |
|-----------|--------|------------------------------------------------|---------|
| `name`    | string | Filtro por nome da operadora (mínimo 3 chars) | `Amil`  |

## 📤 Resposta de Sucesso

**Status:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
    "name": "Amil"
  },
  {
    "id": "b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7",
    "name": "Bradesco Saúde"
  }
]
```

## 🔍 Exemplos de Uso

### Listar todas as operadoras

```bash
curl -X GET http://localhost:3000/api/health-operators \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Filtrar por nome

```bash
curl -X GET "http://localhost:3000/api/health-operators?name=Sul" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Via JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/health-operators?name=Amil', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const operators = await response.json();
console.log(operators);
```

## 🗃️ Popular o Banco de Dados

Para popular o banco com operadoras de saúde brasileiras:

```bash
# Popular apenas operadoras
npm run seed:health-operators

# Ou popular todos os dados de seed
npm run seed:all
```

## 📦 Operadoras Disponíveis (Seed)

- Amil
- Bradesco Saúde
- SulAmérica
- Unimed
- NotreDame Intermédica
- Porto Seguro Saúde
- Hapvida
- Prevent Senior
- Care Plus
- Golden Cross
- Allianz Saúde
- São Francisco Saúde

## ✨ Funcionalidades

- Listagem de todas as operadoras
- Filtro por nome (busca case-insensitive)
- Busca sem diacríticos (ignora acentos)
- Ordenação alfabética por nome
- Autenticação JWT obrigatória
- Documentação Swagger/OpenAPI
- Clean Architecture
- Módulo independente

## 📝 Swagger/OpenAPI

Acesse a documentação interativa em:

```
http://localhost:3000/api/docs
```

Procure pela tag `health-operators` na interface do Swagger.

## 🔒 Segurança

- Autenticação JWT obrigatória
- Validação de dados de entrada
- Sanitização de query parameters
- Prevenção contra SQL Injection (via TypeORM parametrizado)

## 🧩 Integração com Outros Módulos

Este módulo é independente e pode ser utilizado por:
- Módulo de Onboarding (seleção de operadora)
- Módulo de Planos de Saúde (associação com planos)
- Módulo de Beneficiários (gestão de cobertura)

## 🧪 Testes

Para testar a API:

1. Faça login para obter um token JWT
2. Use o token para listar as operadoras:

```bash
curl -X GET http://localhost:3000/api/health-operators \
  -H "Authorization: Bearer TOKEN_RECEBIDO"
```

