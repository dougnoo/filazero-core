"use client";

import { Box, Typography, Avatar, Button } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuth } from "@/shared/hooks/useAuth";

export interface PatientData {
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  allergies?: string;
  chronicConditions?: Array<{ name: string }>;
  medications?: Array<{ name: string }>;
  tenantName?: string;
  planName?: string;
}

interface PatientCardProps {
  patientData?: PatientData | null;
  isLoading?: boolean;
}

export function PatientCard({ patientData, isLoading = false }: PatientCardProps) {
  const theme = useThemeColors();
  const { theme: currentTheme } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const { user } = useAuth();
  
  // Função para abrir o cliente de email
  const handleContactHR = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Email padrão do RH
    const emailTo = "rh@empresa-trigo.com.br";
    const userEmail = user?.email || "";
    const subject = encodeURIComponent("Contato sobre Plano de Saúde");
    
    // Cria o link mailto: Para=email da empresa, CC=email do usuário (se disponível)
    let mailtoLink = `mailto:${emailTo}?subject=${subject}`;
    
    if (userEmail) {
      mailtoLink += `&cc=${encodeURIComponent(userEmail)}`;
    }
    
    // Tenta abrir o cliente de email usando múltiplas abordagens
    try {
      // Método 1: window.location.href
      window.location.href = mailtoLink;
    } catch {
      try {
        // Método 2: Criar elemento <a> temporário
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        // Método 3: window.open como último recurso
        window.open(mailtoLink, '_blank');
      }
    }
  };
  
  // Função para formatar CPF
  const formatCPF = (cpf?: string) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar telefone
  const formatPhone = (phone?: string) => {
    if (!phone) return "";
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");
    
    // Se começar com 55 (código do Brasil), remove
    let phoneNumber = cleaned;
    if (cleaned.startsWith("55") && cleaned.length > 10) {
      phoneNumber = cleaned.substring(2);
    }
    
    // Formata baseado no tamanho
    if (phoneNumber.length === 11) {
      // Celular: (XX) XXXXX-XXXX
      return phoneNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (phoneNumber.length === 10) {
      // Fixo: (XX) XXXX-XXXX
      return phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    
    // Se não conseguir formatar, retorna o original
    return phone;
  };

  // Função para formatar data de nascimento baseada no idioma do navegador
  const formatBirthDate = (date?: string) => {
    if (!date) return "";
    try {
      // Parse da data diretamente da string para evitar problemas de timezone
      // Formato esperado: YYYY-MM-DD
      const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!dateMatch) {
        // Se não estiver no formato esperado, tenta usar Date
        const d = new Date(date);
        const day = String(d.getUTCDate()).padStart(2, "0");
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const year = d.getUTCFullYear();
        
        // Detecta se o idioma é português
        const isPortuguese = typeof navigator !== 'undefined' && 
          (navigator.language?.toLowerCase().includes('pt') || 
           navigator.languages?.some(lang => lang.toLowerCase().includes('pt')));
        
        if (isPortuguese) {
          return `${day}/${month}/${year}`;
        }
        return `${year}-${month}-${day}`;
      }
      
      const [, year, month, day] = dateMatch;
      
      // Detecta se o idioma é português
      const isPortuguese = typeof navigator !== 'undefined' && 
        (navigator.language?.toLowerCase().includes('pt') || 
         navigator.languages?.some(lang => lang.toLowerCase().includes('pt')));
      
      // Se for português, usa formato brasileiro DD/MM/YYYY
      if (isPortuguese) {
        return `${day}/${month}/${year}`;
      }
      // Para outros idiomas (incluindo inglês), usa formato YYYY-MM-DD
      return `${year}-${month}-${day}`;
    } catch {
      return date;
    }
  };

  // Função para capitalizar nome
  const capitalizeName = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const patientInfo = [
    ["Nome:", capitalizeName(patientData?.name) || "-"],
    ["CPF:", formatCPF(patientData?.cpf) || "-"],
    ["Carteirinha:", patientData?.cpf ? formatCPF(patientData.cpf).replace(/\D/g, "") : "-"],
    ["Nascimento:", formatBirthDate(patientData?.birthDate) || "-"],
    ["Telefone:", formatPhone(patientData?.phone) || "-"],
  ];
  return (
    <Box
      id="tour-patient-card"
      sx={{
        width: "100%",
        bgcolor: '#FFFFFF',
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: `1px solid ${theme.softBorder}`, md: "none" },
        p: { xs: "20px", md: "24px" },
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* --- Plano ativo --- */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Header */}
        <Box sx={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
          
            <Avatar
              src="/amil.png"
              sx={{
                width: { xs: 56, md: 84 },
                height: { xs: 56, md: 84 },
                bgcolor: isDefaultTheme ? theme.primary : theme.avatarBackground,
                '& img': {
                  width: { xs: 42, md: 64 },
                  height: { xs: 42, md: 64 },
                  objectFit: 'contain'
                }
              }}
            >
              amil
            </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "16px" },
                fontWeight: 600,
                color: theme.textDark,
                lineHeight: "20px",
              }}
            >
              Amil
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: theme.textMuted,
                lineHeight: "20px",
              }}
            >
              Amil One
            </Typography>
          </Box>
        </Box>

        {/* Status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            bgcolor: theme.successSoftBackground,
            borderRadius: { xs: "10px", md: "8px" },
            py: { xs: "10px", md: "8px" },
            px: { xs: "12px", md: "16px" },
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: { xs: 9, md: 8 },
              height: { xs: 9, md: 8 },
              bgcolor: theme.successSoft,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              color: theme.textDark,
              fontWeight: 500,
              lineHeight: "20px",
            }}
          >
            Ativo até 12/2025
          </Typography>
        </Box>

        {/* Descriptions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLoading ? (
            <Typography sx={{ color: theme.textMuted, fontSize: "13px", textAlign: "center", py: 2 }}>
              Carregando dados...
            </Typography>
          ) : (
            patientInfo.map(([label, value], i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "12px" },
                  color: theme.textMuted,
                  lineHeight: "20px",
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  color: theme.textDark,
                  fontWeight: 500,
                  lineHeight: "20px",
                  textAlign: { xs: "right", md: "left" },
                  wordBreak: { xs: "break-word", md: "normal" },
                }}
              >
                {value}
              </Typography>
            </Box>
            ))
          )}
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "12px", md: "8px" }, mt: { xs: 2, md: "8px" } }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: isDefaultTheme ? theme.secondary : theme.primary,
              color: isDefaultTheme ? theme.white : theme.secondary,
              fontSize: { xs: "15px", md: "14px" },
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 500,
              py: { xs: "14px", md: "10px" },
              "&:hover": { 
                bgcolor: isDefaultTheme ? theme.secondary : theme.primary, 
                opacity: 0.9 
              },
            }}
          >
            Acessar app do plano
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleContactHR}
            sx={{
              borderColor: theme.secondary,
              color: theme.secondary,
              fontSize: { xs: "15px", md: "14px" },
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 500,
              py: { xs: "14px", md: "10px" },
              "&:hover": {
                bgcolor: theme.secondaryHover,
                borderColor: theme.secondary,
              },
            }}
          >
            Falar com RH
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

