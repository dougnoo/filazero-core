'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { CloudUpload, InfoOutlined } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import BackButton from '@/shared/components/BackButton';
import { api } from '@/shared/services/api';

enum TermType {
  TERMS_OF_USE = 'TERMS_OF_USE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
}

const normalizeDuplicateVersionMessage = (message: string): string => {
  if (!message.includes('versão')) {
    return message;
  }

  const versionMatch = message.match(/versão\s+"([^"]+)"/i);
  if (!versionMatch?.[1]) {
    return message;
  }

  const normalizedVersion = versionMatch[1].replace(/^v(?=\d)/i, '');

  return `Já existe um termo com a versão "${normalizedVersion}". Por favor, utilize uma versão diferente.`;
};

export default function ImportarTermoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const termType = searchParams.get('type') === 'privacy'
    ? TermType.PRIVACY_POLICY
    : TermType.TERMS_OF_USE;

  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Selecione um arquivo PDF');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('type', termType);
      formData.append('file', file);
      if (version.trim()) formData.append('version', version.trim());
      if (effectiveDate) formData.append('effectiveDate', effectiveDate);
      if (observations) formData.append('changeDescription', observations);

      await api.post('/api/terms/upload', formData);

      const successMessage = termType === TermType.PRIVACY_POLICY
        ? 'Política de privacidade importada com sucesso!'
        : 'Termo de uso importado com sucesso!';
      setSuccess(successMessage);
      setFile(null);
      setVersion('');
      setEffectiveDate('');
      setObservations('');

      setTimeout(() => {
        const tab = termType === TermType.PRIVACY_POLICY ? '1' : '0';
        router.push(`/super-admin/termos/listagem?tab=${tab}`);
      }, 2000);
    } catch (err: unknown) {
      let errorMessage = 'Erro ao fazer upload';

      if (err instanceof Error) {
        errorMessage = normalizeDuplicateVersionMessage(err.message);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = termType === TermType.TERMS_OF_USE
    ? 'Importar termos de uso'
    : 'Importar política de privacidade';

  const termTypeLabel = termType === TermType.TERMS_OF_USE
    ? 'Termos de Uso'
    : 'Política de Privacidade';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <BackButton variant="icon-only" onClick={() => router.push('/super-admin/termos/listagem')} />

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '20px', md: '24px' },
          mb: 1,
        }}
      >
        {pageTitle}
      </Typography>

      <Typography
        sx={{
          color: 'text.secondary',
          fontSize: '14px',
          mb: 4,
        }}
      >
        Envie a nova versão dos {termTypeLabel} e/ou da Política de Privacidade para atualização na plataforma.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          p: 4,
          borderRadius: '12px',
          bgcolor: '#F8FAFA',
          boxShadow: 'none',
          border: '1px solid #E5E7EB',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '18px',
            mb: 0.5,
          }}
        >
          Upload
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '14px',
            mb: 3,
          }}
        >
          Envie um arquivo em PDF (.pdf ).
        </Typography>

        <Alert
          severity="info"
          icon={<InfoOutlined sx={{ color: '#0369A1' }} />}
          sx={{
            mb: 3,
            bgcolor: '#E0F2FE',
            border: 'none',
            '& .MuiAlert-message': {
              color: '#0369A1',
            },
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#0369A1' }}>
            Nova versão será publicada
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#0369A1', textDecoration: 'underline' }}>
            Ao enviar um novo arquivo, a versão atual dos {termTypeLabel} e da Política de Privacidade será substituída.
            A versão anterior permanecerá registrada no histórico.
          </Typography>
        </Alert>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="Versão"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Ex: 1, 2, 1.0 (opcional)"
            helperText="Deixe em branco para gerar automaticamente"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              },
            }}
          />

          <TextField
            type="date"
            label="Data de vigência"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              },
            }}
          />

          <TextField
            label="Observações internas (opcional)"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Input"
            multiline
            rows={3}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              },
            }}
          />

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : '#D1D5DB',
              borderRadius: '12px',
              p: 5,
              textAlign: 'center',
              bgcolor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#F9FAFB',
              },
            }}
          >
            <input {...getInputProps()} />

            <CloudUpload
              sx={{
                fontSize: 40,
                color: '#9CA3AF',
                mb: 2,
              }}
            />

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '14px',
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {file ? file.name : 'Selecione um arquivo ou arraste e solte aqui'}
            </Typography>

            <Typography
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Arquivo .pdf
            </Typography>

            <Button
              variant="contained"
              component="span"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                py: 1,
                bgcolor: '#1F2937',
                '&:hover': {
                  bgcolor: '#374151',
                },
              }}
            >
              Selecione o arquivo
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 4,
                py: 1.5,
                borderColor: '#D1D5DB',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !file}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 4,
                py: 1.5,
              }}
            >
              {loading ? 'Processando...' : 'Processar importação'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
