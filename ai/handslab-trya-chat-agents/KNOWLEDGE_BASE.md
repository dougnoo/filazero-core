# Integração com Knowledge Base da AWS Bedrock

## O que é Knowledge Base?

A AWS Bedrock Knowledge Base permite que você indexe documentos (PDFs, textos, etc.) e faça consultas semânticas usando embeddings. Perfeito para adicionar conhecimento médico ao agente de triagem.

## Configuração

### 1. Criar Knowledge Base no AWS Console

1. Acesse **AWS Bedrock** → **Knowledge bases**
2. Clique em **Create knowledge base**
3. Configure:
   - Nome: `triagem`
   - Descrição: Base de conhecimento para triagem de saúde
   - IAM role: Criar nova ou usar existente

### 2. Adicionar Data Source

1. Escolha fonte de dados:
   - **S3**: Upload de documentos médicos
   - **Web Crawler**: Páginas web de saúde
   - **Confluence/SharePoint**: Se aplicável

2. Para S3:
   ```powershell
   # Criar bucket
   aws s3 mb s3://triagem-knowledge-base
   
   # Upload de documentos
   aws s3 cp documentos-medicos/ s3://triagem-knowledge-base/ --recursive
   ```

3. Configure sync schedule (opcional)

### 3. Configurar Embeddings

- Escolha modelo de embedding:
  - **Titan Embeddings G1 - Text** (recomendado)
  - Dimensões: 1536
  - Chunk size: 300-500 tokens

### 4. Configurar Vector Database

- **OpenSearch Serverless** (recomendado)
- Ou Amazon Aurora PostgreSQL com pgvector

### 5. Obter Knowledge Base ID

Após criar, copie o **Knowledge Base ID** (formato: `XXXXXXXXXX`)

### 6. Configurar no Projeto

Edite o arquivo `.env`:

```bash
# AWS Bedrock Knowledge Base
KNOWLEDGE_BASE_ID=XXXXXXXXXX
```

## Permissões IAM Necessárias

Adicione ao template SAM ou role da Lambda:

```yaml
Policies:
  - Statement:
    - Effect: Allow
      Action:
        - bedrock:Retrieve
        - bedrock:RetrieveAndGenerate
      Resource: 
        - !Sub 'arn:aws:bedrock:${AWS::Region}:${AWS::AccountId}:knowledge-base/*'
```

## Teste Local

```powershell
# Configure o .env
echo "KNOWLEDGE_BASE_ID=seu-id-aqui" >> .env

# Execute
python src/lambda_handler.py
```

## Como Funciona

1. **Usuário** envia mensagem: "dor de cabeça"
2. **Data Collector** consulta Knowledge Base com a query
3. **Bedrock** busca documentos relevantes usando embeddings
4. **Agente** recebe contexto e responde com base nas informações

## Exemplo de Uso

### Input do Usuário:
```
"Estou com dor de cabeça forte"
```

### O que acontece:
1. Query à KB: "dor de cabeça forte"
2. KB retorna documentos sobre:
   - Tipos de dor de cabeça
   - Sinais de alerta
   - Tratamentos básicos
3. Agente usa esse contexto para fazer perguntas mais precisas

### Resposta do Agente:
```
Com base nas informações, vou fazer algumas perguntas para entender melhor:

1. A dor é pulsante ou contínua?
2. Em qual parte da cabeça você sente?
3. Há quanto tempo começou?
[... usando conhecimento da base para guiar perguntas]
```

## Documentos Recomendados para Upload

Para triagem de saúde:

1. **Protocolos de triagem**: Manchester, ACEP, etc.
2. **Guias de sintomas**: Por sistema (cardiovascular, respiratório, etc.)
3. **Primeiros socorros**: Cuidados básicos
4. **Sinais de alerta**: Red flags médicos
5. **FAQ médico**: Perguntas frequentes

## Estrutura de Documentos

```
s3://triagem-knowledge-base/
├── protocolos/
│   ├── triagem-manchester.pdf
│   └── classificacao-risco.pdf
├── sintomas/
│   ├── cardiovascular.md
│   ├── respiratorio.md
│   └── neurologico.md
├── primeiros-socorros/
│   └── guia-basico.pdf
└── red-flags/
    └── sinais-alerta.md
```

## Monitoramento

### CloudWatch Metrics

- `RetrievalCount`: Número de consultas
- `RetrievalLatency`: Latência das buscas
- `RetrievalErrors`: Erros

### Logs

```python
# Logs automáticos no agente
logger.info("🔍 Consultando Knowledge Base...")
logger.info("✅ X resultados encontrados")
```

## Custos

- **Embedding**: ~$0.0001 por 1K tokens
- **OpenSearch Serverless**: ~$0.24/hora OCU
- **Storage**: ~$0.03/GB/mês

## Troubleshooting

### Erro: "Knowledge Base not found"
- Verifique se o ID está correto
- Confirme que a KB está no status "Available"

### Erro: "Access Denied"
- Adicione permissão `bedrock:Retrieve`
- Verifique IAM role

### Nenhum resultado retornado
- Verifique se os documentos foram sincronizados
- Teste queries mais genéricas
- Ajuste `numberOfResults` (padrão: 3)

## Desativar Knowledge Base

Para desabilitar temporariamente:

```bash
# Remove do .env
# KNOWLEDGE_BASE_ID=
```

O agente funcionará normalmente sem KB.
