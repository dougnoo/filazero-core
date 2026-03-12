# Prescriptions Module

Módulo de integração com a plataforma **Memed** para prescrição digital de medicamentos e exames.

## 📋 Estrutura

```
prescriptions/
├── domain/
│   ├── entities/
│   │   └── Prescription.entity.ts       # Entidade de domínio com regras de negócio
│   └── repositories/
│       └── prescription.repository.ts    # Interface do repositório
├── application/
│   ├── dtos/
│   │   ├── create-prescription.dto.ts   # DTO para criação
│   │   └── send-prescription.dto.ts      # DTO para envio
│   └── use-cases/
│       ├── create-prescription.use-case.ts
│       ├── get-prescription.use-case.ts
│       ├── send-prescription.use-case.ts
│       └── list-prescriptions.use-case.ts
├── infrastructure/
│   ├── entities/
│   │   └── Prescription.entity.ts       # Entidade TypeORM
│   ├── mappers/
│   │   └── prescription.mapper.ts       # Mapper domain ↔ infrastructure
│   ├── repositories/
│   │   └── typeorm-prescription.repository.ts
│   └── services/
│       └── memed.service.ts             # Integração com API Memed
├── presentation/
│   └── controllers/
│       └── prescriptions.controller.ts   # REST API endpoints
└── prescriptions.module.ts              # Módulo NestJS
```

## 🔌 API Endpoints

### 1. Criar Prescrição

**POST** `/prescriptions`

Cria uma nova prescrição via Memed e salva no banco de dados.

```json
{
  "tenantId": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "patientName": "João Silva",
  "patientCpf": "123.456.789-00",
  "sessionId": "optional-session-id",
  "medications": [
    {
      "name": "Dipirona 500mg",
      "dosage": "500mg",
      "instructions": "Tomar 1 comprimido a cada 6 horas",
      "quantity": 20
    }
  ],
  "exams": [
    {
      "name": "Hemograma Completo",
      "instructions": "Em jejum de 8 horas"
    }
  ]
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "memedToken": "abc123",
  "pdfUrl": "https://memed.com.br/prescricao/abc123.pdf",
  "patientName": "João Silva",
  "medications": [...],
  "exams": [...],
  "createdAt": "2024-12-09T10:00:00Z"
}
```

### 2. Buscar Prescrição

**GET** `/prescriptions/:id`

Retorna detalhes de uma prescrição específica.

**Response 200:**
```json
{
  "id": "uuid",
  "memedToken": "abc123",
  "tenantId": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "patientName": "João Silva",
  "patientCpf": "123.456.789-00",
  "medications": [...],
  "exams": [...],
  "pdfUrl": "https://...",
  "sentVia": ["email", "whatsapp"],
  "sentAt": "2024-12-09T11:00:00Z",
  "createdAt": "2024-12-09T10:00:00Z",
  "updatedAt": "2024-12-09T11:00:00Z"
}
```

### 3. Enviar Prescrição

**POST** `/prescriptions/:id/send`

Envia a prescrição para o paciente via email, SMS ou WhatsApp.

```json
{
  "sendVia": ["email", "whatsapp"],
  "email": "paciente@email.com",
  "phone": "+5511999999999"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "sentVia": ["email", "whatsapp"],
  "sentAt": "2024-12-09T11:00:00Z"
}
```

### 4. Listar Prescrições

**GET** `/prescriptions?doctorId=uuid`
**GET** `/prescriptions?patientId=uuid`
**GET** `/prescriptions?tenantId=uuid`

Lista prescrições filtradas por médico, paciente ou tenant.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "memedToken": "abc123",
    "doctorId": "uuid",
    "patientId": "uuid",
    "patientName": "João Silva",
    "pdfUrl": "https://...",
    "sentVia": ["email"],
    "sentAt": "2024-12-09T11:00:00Z",
    "createdAt": "2024-12-09T10:00:00Z"
  }
]
```

## 🗄️ Database Schema

```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memed_token VARCHAR UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  patient_name VARCHAR NOT NULL,
  patient_cpf VARCHAR,
  session_id VARCHAR,
  medications JSONB DEFAULT '[]',
  exams JSONB DEFAULT '[]',
  pdf_url VARCHAR,
  sent_via VARCHAR[],
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_memed_token ON prescriptions(memed_token);
CREATE INDEX idx_prescriptions_tenant_id ON prescriptions(tenant_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_session_id ON prescriptions(session_id);
```

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione ao `.env`:

```bash
# Memed Integration
MEMED_API_KEY=your_api_key_here
MEMED_SECRET_KEY=your_secret_key_here
MEMED_ENVIRONMENT=sandbox  # ou 'production'
```

### Credenciais por Tenant

Para configuração multi-tenant com diferentes credenciais Memed por cliente:

1. Crie tabela `tenant_configs`:
```sql
CREATE TABLE tenant_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  memed_api_key VARCHAR NOT NULL,
  memed_secret_key VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Atualize o controller para buscar credenciais do tenant:
```typescript
// No PrescriptionsController
const tenantConfig = await this.getTenantConfig(createDto.tenantId);
const credentials: MemedCredentials = {
  apiKey: tenantConfig.memedApiKey,
  secretKey: tenantConfig.memedSecretKey,
};
```

## 🔧 Migration

Rode a migration para criar a tabela:

```bash
# Gerar migration (já criada)
npm run migration:generate -- src/database/migrations/CreatePrescriptionsTable

# Rodar migration
npm run migration:run

# Reverter migration
npm run migration:revert
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Memed API

Documentação oficial: https://doc.memed.com.br/docs/primeiros-passos/

### Sandbox

- Base URL: `https://api.memed.com.br/v1`
- Credenciais de teste disponíveis no dashboard Memed

### Endpoints Utilizados

- `POST /prescricoes` - Criar prescrição
- `GET /prescricoes/:token` - Buscar prescrição
- `GET /prescricoes/:token/pdf` - Obter PDF
- `POST /prescricoes/:token/enviar` - Enviar por email/SMS/WhatsApp

## 🏗️ Arquitetura Clean Architecture

### Domain Layer
- **Entities**: Regras de negócio da prescrição
- **Repositories**: Interface de persistência

### Application Layer
- **Use Cases**: Casos de uso isolados
- **DTOs**: Objetos de transferência de dados

### Infrastructure Layer
- **TypeORM Entities**: Mapeamento ORM
- **Repositories**: Implementação TypeORM
- **Services**: Integração com APIs externas (Memed)

### Presentation Layer
- **Controllers**: Endpoints REST
- **Guards**: Autenticação e autorização

## 🔐 Segurança

- Autenticação JWT obrigatória
- Role-based access control (RBAC)
- Validação de DTOs com class-validator
- Credentials por tenant (isolamento)
- Logs de auditoria (TODO)

## 📝 TODO

- [ ] Implementar tenant_configs table para credenciais por cliente
- [ ] Adicionar logs de auditoria
- [ ] Implementar cache Redis para PDFs
- [ ] Webhook Memed para status de envio
- [ ] Testes unitários e E2E
- [ ] Integração com frontend (modal de prescrição)
- [ ] Fila de processamento assíncrono (Bull)
- [ ] Retry mechanism para falhas na API Memed

## 🎯 Próximos Passos

1. **Frontend Integration**: Criar modal de prescrição no dashboard médico
2. **Tenant Config**: Implementar configuração de credenciais por tenant
3. **Testing**: Escrever testes com credenciais sandbox Memed
4. **Monitoring**: Adicionar logs e métricas de uso
