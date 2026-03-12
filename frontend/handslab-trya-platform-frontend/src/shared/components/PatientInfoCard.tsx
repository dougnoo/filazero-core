"use client";

import { Box, Typography, Avatar, Divider } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

export interface PatientInfoData {
  name: string;
  age?: number;
  avatar?: string;
  cardNumber?: string;
  startTime?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  gender?: string;
  additionalInfo?: Array<{ label: string; value: string }>;
}

interface PatientInfoCardProps {
  patient: PatientInfoData;
  title?: string;
}

export function PatientInfoCard({ patient, title = "Informações do paciente" }: PatientInfoCardProps) {
  const theme = useThemeColors();

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "16px",
          color: theme.textDark,
          mb: 3,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Avatar e Nome */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={patient.avatar}
            sx={{
              width: 56,
              height: 56,
              bgcolor: theme.primary,
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            {getInitials(patient.name)}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: theme.textDark,
              }}
            >
              {patient.name}
            </Typography>
            {patient.age && (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textMuted,
                }}
              >
                {patient.age} Anos
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Informações */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {patient.cardNumber && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BadgeIcon sx={{ fontSize: 20, color: theme.textMuted }} />
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                Carteirinha nº {patient.cardNumber}
              </Typography>
            </Box>
          )}

          {patient.startTime && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 20, color: theme.textMuted }} />
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                Iniciado em {patient.startTime}
              </Typography>
            </Box>
          )}

          {patient.cpf && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
                CPF:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                {patient.cpf}
              </Typography>
            </Box>
          )}

          {patient.birthDate && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
                Nascimento:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                {patient.birthDate}
              </Typography>
            </Box>
          )}

          {patient.phone && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
                Telefone:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                {patient.phone}
              </Typography>
            </Box>
          )}

          {patient.gender && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
                Gênero:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                {patient.gender}
              </Typography>
            </Box>
          )}

          {/* Informações adicionais customizadas */}
          {patient.additionalInfo?.map((info, index) => (
            <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
                {info.label}
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                {info.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

