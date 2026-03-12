# Configuração de Ambiente

## Variáveis de Ambiente

Para configurar a aplicação, você precisa criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### .env.local
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Como Configurar

1. **Crie o arquivo `.env.local`** na raiz do projeto:
   ```bash
   touch .env.local
   ```

2. **Adicione as variáveis** conforme mostrado acima

3. **Ajuste a URL da API** conforme necessário:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://sua-api.com`

## Importante

- O arquivo `.env.local` está no `.gitignore` e **NÃO será commitado**
- Use `.env.example` como referência para outros desenvolvedores
- As variáveis `NEXT_PUBLIC_*` são expostas no cliente
- Reinicie o servidor após alterar as variáveis de ambiente

## Estrutura de Arquivos

```
projeto/
├── .env.local          # Suas configurações locais (não commitado)
├── .env.example        # Exemplo de configuração (commitado)
├── .gitignore          # Inclui .env.local
└── src/
    └── shared/
        └── services/
            └── authService.ts  # Usa process.env.NEXT_PUBLIC_API_BASE_URL
```
