# Política de Retenção de Dados - LGPD

## 📜 Conformidade com LGPD

Este documento detalha a política de retenção de dados do sistema de triagem de saúde, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

## 🎯 Finalidade do Tratamento

**Objetivo**: Realizar triagem pré-clínica para auxiliar profissionais de saúde no atendimento inicial de pacientes.

**Base Legal**: Art. 11, II, f - Tutela da saúde (dados sensíveis de saúde)

## ⏱️ Prazo de Retenção

### Configuração Atual: 7 dias (168 horas)

**Justificativa**:
- Tempo suficiente para o paciente consultar o médico após a triagem
- Médico pode acessar o histórico recente da conversa durante o atendimento
- Minimiza riscos de segurança mantendo dados apenas pelo tempo necessário
- Atende ao princípio da necessidade (LGPD Art. 6º, III)

### Opções de Configuração

O TTL pode ser ajustado através da variável de ambiente `SESSION_TTL_HOURS`:

```yaml
# template.yaml
SESSION_TTL_HOURS: "168"  # 7 dias (padrão recomendado)
```

**Alternativas válidas conforme contexto**:

| Prazo | Horas | Cenário |
|-------|-------|---------|
| 24 horas | 24 | Triagem urgente/emergencial |
| 3 dias | 72 | Triagem ambulatorial rápida |
| **7 dias** | **168** | **Triagem pré-consulta (recomendado)** |
| 30 dias | 720 | Triagem com agendamento posterior |
| 90 dias | 2160 | Histórico para análises estatísticas (anonimizado) |

## 📋 Dados Armazenados

### Dados Coletados por Sessão
```json
{
  "session_id": "uuid-da-sessao",
  "messages": [
    {"type": "HumanMessage", "content": "sintomas relatados"},
    {"type": "AIMessage", "content": "perguntas do agente"}
  ],
  "patient_data": {
    "symptoms": ["febre", "dor de cabeça"],
    "intensity": "grave"
  },
  "consent_status": "authorized",
  "medical_summary": {
    "conversation_summary": "...",
    "main_symptoms": [...],
    "chief_complaint": "...",
    "suggested_exams": [...]
  },
  "updated_at": "2025-11-19T10:30:00",
  "ttl": 1732629000
}
```

### Categorias de Dados Pessoais

**Dados Sensíveis (Art. 11 LGPD)**:
- ✅ Dados de saúde (sintomas, diagnósticos preliminares)
- ⚠️ Sem coleta de: nome, CPF, telefone, endereço

**Pseudonimização**:
- `session_id` é gerado aleatoriamente (UUID)
- Não vincula diretamente à identidade do titular

## 🔒 Medidas de Segurança

### Implementadas

1. **Criptografia em repouso**: DynamoDB com encryption at rest
2. **Criptografia em trânsito**: HTTPS/TLS para API Gateway
3. **Controle de acesso**: IAM roles com least privilege
4. **TTL automático**: Exclusão automática após o prazo configurado
5. **Logs auditáveis**: CloudWatch Logs para rastreabilidade

### Recomendadas para Produção

1. **Anonimização**: Remover identificadores antes de análises agregadas
2. **Backup limitado**: Não fazer backup de longo prazo das sessões
3. **VPC privada**: Isolar recursos em rede privada
4. **KMS**: Chaves gerenciadas pelo cliente para criptografia
5. **Termo de Consentimento**: Coletar aceite explícito do paciente

## 👤 Direitos dos Titulares (Art. 18 LGPD)

### Como Implementar

**1. Direito de Acesso** (Art. 18, II)
```bash
# Permitir que o paciente consulte seus dados
aws dynamodb get-item \
  --table-name triagem-sessions \
  --key '{"session_id": {"S": "session-do-paciente"}}'
```

**2. Direito de Exclusão** (Art. 18, VI)
```bash
# Permitir exclusão antecipada (antes do TTL)
aws dynamodb delete-item \
  --table-name triagem-sessions \
  --key '{"session_id": {"S": "session-do-paciente"}}'
```

**3. Portabilidade** (Art. 18, V)
- API pode exportar dados em JSON estruturado

## 📊 Após o Atendimento Médico

### Opção 1: Descarte Imediato (Recomendado para Triagem)
Após o médico atender o paciente e registrar no prontuário oficial:
```python
session_manager.delete_session(session_id)
```

### Opção 2: Transferência para Prontuário
Se o sistema fizer parte do prontuário eletrônico:
- Transferir dados para sistema de gestão hospitalar
- Manter por **20 anos** conforme Resolução CFM 1.821/2007
- Aplicar controles de acesso mais rigorosos

### Opção 3: Anonimização para Pesquisa
Para análises estatísticas (com consentimento específico):
```python
# Remove identificadores
anonymized_data = {
    "symptoms": session["patient_data"]["symptoms"],
    "chief_complaint": session["medical_summary"]["chief_complaint"],
    "timestamp": session["updated_at"][:7]  # Apenas ano-mês
}
# Remove session_id e dados específicos
```

## 🏥 Contexto Médico vs. Tecnológico

### Resolução CFM 1.821/2007
- Prontuário médico: **mínimo 20 anos**
- Imagens/exames: **mínimo 20 anos**
- Aplica-se a registros clínicos oficiais

### Triagem Digital Pré-Consulta (Este Sistema)
- **Não é prontuário oficial**
- É ferramenta de apoio pré-atendimento
- Dados devem ser transcritos pelo médico para o prontuário oficial
- Retenção curta (7 dias) é adequada

## 📝 Documentação Obrigatória

### Para Conformidade LGPD

1. **Relatório de Impacto (RIPD)** - Recomendado para dados de saúde
2. **Registro de Atividades de Tratamento** (Art. 37)
3. **Política de Privacidade** - Informar ao paciente
4. **Termo de Consentimento** - Coletar autorização explícita
5. **Procedimentos de Resposta a Incidentes**

### Template de Termo de Consentimento

```markdown
## Termo de Consentimento para Triagem Digital

Ao utilizar este serviço de triagem digital, você autoriza:

✅ A coleta de informações sobre seus sintomas e estado de saúde
✅ O processamento dessas informações por inteligência artificial
✅ O compartilhamento do resumo com o profissional de saúde que irá atendê-lo
✅ O armazenamento temporário dos dados por até 7 dias

ℹ️  **Seus Direitos:**
- Solicitar acesso aos seus dados
- Solicitar exclusão antecipada
- Revogar consentimento a qualquer momento

📧 **Contato do Controlador de Dados:**
[Nome da instituição]
[E-mail do DPO]
[Telefone]

[ ] Li e aceito os termos acima
```

## 🔄 Auditoria e Revisão

### Frequência de Revisão da Política
- **Trimestral**: Avaliar se o prazo de 7 dias continua adequado
- **Anual**: Revisar conformidade com alterações na legislação
- **Sob demanda**: Após incidentes ou mudanças no processo

### Indicadores de Monitoramento
```sql
-- Número de sessões expiradas por TTL (conformidade)
SELECT COUNT(*) FROM triagem_sessions WHERE ttl < CURRENT_TIMESTAMP

-- Tempo médio de retenção (deve ser < 7 dias)
SELECT AVG(ttl - created_at) FROM triagem_sessions

-- Requisições de exclusão manual (direito LGPD)
SELECT COUNT(*) FROM audit_logs WHERE action = 'DELETE_SESSION'
```

## ⚠️ Avisos Importantes

### Produção
1. **Nunca** armazene dados de saúde sem consentimento explícito
2. **Sempre** nomeie um Encarregado de Dados (DPO)
3. **Configure** alertas para possíveis violações de dados
4. **Documente** todas as transferências de dados (se houver)
5. **Teste** procedimentos de resposta a incidentes

### Desenvolvimento/Teste
- Use dados sintéticos ou anonimizados
- Não use dados reais de pacientes
- TTL ainda menor (24h) para ambientes de teste

## 📚 Referências Legais

- **LGPD**: Lei nº 13.709/2018
  - Art. 6º - Princípios
  - Art. 11 - Dados sensíveis de saúde
  - Art. 18 - Direitos dos titulares
  - Art. 37 - Registro das operações
  
- **Resolução CFM 1.821/2007**: Prontuários médicos
- **Resolução CFM 2.227/2018**: Telemedicina
- **Resolução ANPD nº 2/2022**: Agentes de tratamento de pequeno porte

## 🤝 Responsabilidades

**Controlador**: Instituição de saúde que opera o sistema
**Operador**: AWS (infraestrutura), OpenAI/Anthropic (modelos)
**Encarregado (DPO)**: [Designar pessoa responsável]

---

**Última atualização**: 2025-11-19
**Próxima revisão**: 2026-02-19
