"use client";

import { Box, Typography, Avatar, Divider } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

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
        bgcolor: "background.paper",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "16px",
           
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
              bgcolor: "primary.main",
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
                 
              }}
            >
              {patient.name}
            </Typography>
            {patient.age && (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "grey.800",
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
              <BadgeIcon sx={{ fontSize: 20, color: "grey.800" }} />
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                Carteirinha nº {patient.cardNumber}
              </Typography>
            </Box>
          )}

          {patient.startTime && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 20, color: "grey.800" }} />
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                Iniciado em {patient.startTime}
              </Typography>
            </Box>
          )}

          {patient.cpf && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px",   }}>
                CPF:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                {patient.cpf}
              </Typography>
            </Box>
          )}

          {patient.birthDate && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px",   }}>
                Nascimento:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                {patient.birthDate}
              </Typography>
            </Box>
          )}

          {patient.phone && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px",   }}>
                Telefone:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                {patient.phone}
              </Typography>
            </Box>
          )}

          {patient.gender && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px",   }}>
                Gênero:
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                {patient.gender}
              </Typography>
            </Box>
          )}

          {/* Informações adicionais customizadas */}
          {patient.additionalInfo?.map((info, index) => (
            <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "14px",   }}>
                {info.label}
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
                {info.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

