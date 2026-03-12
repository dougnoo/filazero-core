# 🚀 Guia Rápido para Desenvolvedores

Este guia contém exemplos práticos e rápidos para tarefas comuns no projeto.

---

## 📋 Índice

1. [Criar um Novo Card](#criar-um-novo-card)
2. [Criar um Novo Botão](#criar-um-novo-botão)
3. [Criar um Formulário](#criar-um-formulário)
4. [Buscar Dados da API](#buscar-dados-da-api)
5. [Adicionar uma Nova Rota](#adicionar-uma-nova-rota)
6. [Criar um Modal](#criar-um-modal)
7. [Criar uma Lista com Paginação](#criar-uma-lista-com-paginação)
8. [Usar Loading States](#usar-loading-states)
9. [Tratar Erros](#tratar-erros)
10. [Adicionar Validação](#adicionar-validação)

---

## 🎴 Criar um Novo Card

```typescript
'use client';

import { Box, Typography } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface MeuCardProps {
  title: string;
  description?: string;
}

export function MeuCard({ title, description }: MeuCardProps) {
  const theme = useThemeColors();
  
  return (
    <Box
      sx={{
        bgcolor: theme.cardBackground, // Sempre branco (#FFFFFF)
        borderRadius: '8px',
        p: 3,
        border: { xs: `1px solid ${theme.softBorder}`, md: 'none' },
        fontFamily: theme.fontFamily,
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 600,
          color: theme.textDark,
          mb: description ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            fontSize: '14px',
            color: theme.textMuted,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
```

**Uso:**
```typescript
<MeuCard 
  title="Título do Card" 
  description="Descrição opcional" 
/>
```

---

## 🔘 Criar um Novo Botão

```typescript
'use client';

import { Button } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface MeuBotaoProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function MeuBotao({ onClick, disabled, children }: MeuBotaoProps) {
  const theme = useThemeColors();
  
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      sx={{
        bgcolor: disabled ? '#4A6060' : theme.primary,
        color: theme.white, // Sempre branco
        fontSize: '14px',
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: '8px',
        py: 1.5,
        px: 3,
        fontFamily: theme.fontFamily,
        '&:hover': {
          bgcolor: disabled ? '#4A6060' : theme.primary,
          opacity: 0.9,
        },
        '&:disabled': {
          bgcolor: '#4A6060', // Cinza escuro quando desabilitado
          color: theme.white,
          opacity: 1,
        },
      }}
    >
      {children}
    </Button>
  );
}
```

**Uso:**
```typescript
<MeuBotao onClick={() => console.log('clicou')}>
  Clique aqui
</MeuBotao>
```

---

## 📝 Criar um Formulário

```typescript
'use client';

import { useState } from 'react';
import { Box, TextField, Button, Stack } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface FormData {
  name: string;
  email: string;
}

export function MeuFormulario() {
  const theme = useThemeColors();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpa erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      // Sua lógica de submit aqui
      console.log('Dados:', formData);
      // await api.post('/endpoint', formData);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Nome"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: theme.fontFamily,
              '& fieldset': {
                borderColor: theme.softBorder,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.primary,
              },
            },
          }}
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: theme.fontFamily,
              '& fieldset': {
                borderColor: theme.softBorder,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.primary,
              },
            },
          }}
        />
        
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: theme.primary,
            color: theme.white,
            textTransform: 'none',
            fontFamily: theme.fontFamily,
          }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </Stack>
    </Box>
  );
}
```

---

## 🌐 Buscar Dados da API

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { api } from '@/shared/services/api';

interface MeusDados {
  id: string;
  name: string;
  description: string;
}

export function MinhaLista() {
  const theme = useThemeColors();
  const [data, setData] = useState<MeusDados[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<MeusDados[]>('/meu-endpoint');
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: theme.textMuted }}>
          {error}
        </Typography>
      </Box>
    );
  }
  
  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: theme.textMuted }}>
          Nenhum dado encontrado
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {data.map((item) => (
        <Box key={item.id} sx={{ p: 2, mb: 2, bgcolor: theme.cardBackground, borderRadius: '8px' }}>
          <Typography sx={{ fontWeight: 600, color: theme.textDark }}>
            {item.name}
          </Typography>
          <Typography sx={{ color: theme.textMuted, fontSize: '14px' }}>
            {item.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
```

---

## 🛣️ Adicionar uma Nova Rota

### 1. Criar a estrutura de pastas

```bash
# Para rota autenticada
mkdir -p src/app/(authenticated)/minha-rota

# Para rota pública
mkdir -p src/app/(unauthenticated)/minha-rota
```

### 2. Criar o arquivo page.tsx

```typescript
'use client';

import { Box } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function MinhaRotaPage() {
  const theme = useThemeColors();
  
  return (
    <Box
      sx={{
        bgcolor: theme.background,
        minHeight: 'calc(100vh - 64px)',
        p: 3,
      }}
    >
      <h1>Minha Nova Rota</h1>
    </Box>
  );
}
```

### 3. Adicionar link de navegação (se necessário)

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/minha-rota');
```

---

## 🪟 Criar um Modal

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface MeuModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
}

export function MeuModal({ open, onClose, title, children, onConfirm }: MeuModalProps) {
  const theme = useThemeColors();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          fontFamily: theme.fontFamily,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '18px',
          fontWeight: 600,
          color: theme.textDark,
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme.textMuted,
            textTransform: 'none',
            fontFamily: theme.fontFamily,
          }}
        >
          Cancelar
        </Button>
        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{
              bgcolor: theme.primary,
              color: theme.white,
              textTransform: 'none',
              fontFamily: theme.fontFamily,
            }}
          >
            Confirmar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

**Uso:**
```typescript
const [open, setOpen] = useState(false);

<MeuModal
  open={open}
  onClose={() => setOpen(false)}
  title="Título do Modal"
  onConfirm={() => {
    // Lógica de confirmação
    setOpen(false);
  }}
>
  <p>Conteúdo do modal</p>
</MeuModal>
```

---

## 📄 Criar uma Lista com Paginação

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Pagination, Stack } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { api } from '@/shared/services/api';

interface Item {
  id: string;
  name: string;
}

export function ListaComPaginacao() {
  const theme = useThemeColors();
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const itemsPerPage = 10;
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await api.get<{ data: Item[]; total: number }>(
          `/meu-endpoint?page=${page}&limit=${itemsPerPage}`
        );
        setItems(response.data.data);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [page]);
  
  return (
    <Box>
      <Stack spacing={2}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 2,
              bgcolor: theme.cardBackground,
              borderRadius: '8px',
              border: `1px solid ${theme.softBorder}`,
            }}
          >
            <Typography sx={{ color: theme.textDark }}>
              {item.name}
            </Typography>
          </Box>
        ))}
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontFamily: theme.fontFamily,
                },
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
```

---

## ⏳ Usar Loading States

```typescript
'use client';

import { useState } from 'react';
import { Box, CircularProgress, Button } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export function ComponenteComLoading() {
  const theme = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = async () => {
    setIsLoading(true);
    try {
      // Sua operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box>
      <Button
        onClick={handleAction}
        disabled={isLoading}
        sx={{
          bgcolor: theme.primary,
          color: theme.white,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: theme.white }} />
            Carregando...
          </Box>
        ) : (
          'Executar Ação'
        )}
      </Button>
    </Box>
  );
}
```

---

## ⚠️ Tratar Erros

```typescript
'use client';

import { useState } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export function ComponenteComTratamentoErro() {
  const theme = useThemeColors();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      setError(null);
      // Sua operação
      setSuccess('Operação realizada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao executar operação');
    }
  };
  
  return (
    <Box>
      {/* Snackbar para erros */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ fontFamily: theme.fontFamily }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      {/* Snackbar para sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ fontFamily: theme.fontFamily }}
        >
          {success}
        </Alert>
      </Snackbar>
      
      {/* Seu conteúdo aqui */}
    </Box>
  );
}
```

---

## ✅ Adicionar Validação

```typescript
'use client';

import { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export function CampoComValidacao() {
  const theme = useThemeColors();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const validate = (val: string): string | null => {
    if (!val.trim()) {
      return 'Campo obrigatório';
    }
    if (val.length < 3) {
      return 'Mínimo de 3 caracteres';
    }
    return null;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Valida em tempo real (opcional)
    const validationError = validate(newValue);
    setError(validationError);
  };
  
  const handleBlur = () => {
    // Valida quando sai do campo
    const validationError = validate(value);
    setError(validationError);
  };
  
  return (
    <TextField
      fullWidth
      label="Nome"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={!!error}
      helperText={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontFamily: theme.fontFamily,
          '& fieldset': {
            borderColor: theme.softBorder,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.primary,
          },
          '&.Mui-error fieldset': {
            borderColor: '#d32f2f',
          },
        },
      }}
    />
  );
}
```

---

## 🎨 Checklist de Estilo

Ao criar um componente, certifique-se de:

- ✅ Usar `useThemeColors()` para todas as cores
- ✅ Usar `theme.fontFamily` para fontes
- ✅ Cards devem ter `bgcolor: theme.cardBackground` (branco)
- ✅ Botões devem ter `color: theme.white` (texto branco)
- ✅ Botões desabilitados devem ter `bgcolor: '#4A6060'`
- ✅ Usar `borderRadius: '8px'` para bordas arredondadas
- ✅ Usar `textTransform: 'none'` em botões
- ✅ Responsivo: usar `{ xs: ..., md: ... }` quando necessário

---

## 📚 Recursos Adicionais

- [README.md](./README.md) - Documentação completa do projeto
- [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) - Guia de multi-tenancy
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Configuração de ambiente

---

**💡 Dica**: Sempre consulte componentes existentes no projeto como referência!

