import { Box, Typography, Paper, Divider, Button} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { ErrorState } from "@/shared/components/ErrorState";
import { SidebarSkeleton } from "./SidebarSkeleton";
import type { BeneficiaryDetails, MedicalApprovalRequest } from "../../../../types";
import { useRouter } from "next/navigation";

interface SidebarProps {
  beneficiary?: BeneficiaryDetails;
  medicalApprovalRequest?: MedicalApprovalRequest;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function Sidebar({ 
  beneficiary, 
  medicalApprovalRequest, 
  loading = false, 
  error, 
  onRetry 
}: SidebarProps) {
  const theme = useThemeColors();
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: "18px" }} />}
        onClick={handleBack}
        variant='contained'
        color="inherit"
        sx={{
          color: theme.textDark,
          backgroundColor: theme.white,
          boxShadow: 'none',
          textAlign: 'left',
          fontSize: "14px",
          fontWeight: 400,
          textTransform: "none",
          px: 2,
          minWidth: "auto",
          justifyContent: "flex-start"
        }}
      >
        Voltar
      </Button>

      <Paper
        sx={{
          bgcolor: "white",
          borderRadius: "12px",
          p: 3,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Header - sempre visível */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "20px",
            color: theme.textDark,
            mb: 3,
          }}
          component="h3"
        >
          Informações do paciente
        </Typography>
        <Divider />

        {/* Content - condicional baseado no estado */}
        {loading ? (
          <SidebarContent loading />
        ) : error ? (
          <ErrorState
            title="Erro ao carregar dados do paciente"
            message={error}
            onRetry={onRetry}
            variant="outlined"
          />
        ) : beneficiary && medicalApprovalRequest ? (
          <SidebarContent 
            beneficiary={beneficiary} 
            medicalApprovalRequest={medicalApprovalRequest} 
          />
        ) : null}
      </Paper>
    </Box>
  );
}

// Componente separado para o conteúdo dos dados
interface SidebarContentProps {
  beneficiary?: BeneficiaryDetails;
  medicalApprovalRequest?: MedicalApprovalRequest;
  loading?: boolean;
}

function SidebarContent({ beneficiary, medicalApprovalRequest, loading }: SidebarContentProps) {
  const theme = useThemeColors();

  if (loading) {
    return <SidebarSkeleton />;
  }

  if (!beneficiary || !medicalApprovalRequest) {
    return null;
  }

  return (
    <Box>

      {/* Dados Pessoais */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: theme.textDark,
            mb: 2,
          }}
        >
          Dados pessoais
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Nome:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.name}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Idade:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.age} anos
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              CPF:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.cpf}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Carteirinha:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.cardNumber}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Telefone:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.phone}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Gênero:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {beneficiary.gender}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              Início da consulta:
            </Typography>
            <Typography sx={{ color: theme.textDark, fontSize: "14px", fontWeight: 500 }}>
              {new Date(medicalApprovalRequest.createdAt).toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Histórico Médico */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: theme.textDark,
            mb: 2,
          }}
        >
          Histórico médico
        </Typography>
        
        {/* Condições */}
        {beneficiary.conditions && beneficiary.conditions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px", mb: 1 }}>
              Condições:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {beneficiary.conditions.map((condition: string, index: number) => (
                <Typography
                  component="li"
                  key={index}
                  sx={{ color: theme.textDark, fontSize: "14px", mb: 0.5 }}
                >
                  {condition}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Medicamentos */}
        {beneficiary.medications && beneficiary.medications.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px", mb: 1 }}>
              Medicamentos:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {beneficiary.medications.map((medication, index: number) => (
                <Typography
                  component="li"
                  key={index}
                  sx={{ color: theme.textDark, fontSize: "14px", mb: 0.5 }}
                >
                  {medication.name} - {medication.dosage}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Alergias */}
        {beneficiary.allergies && beneficiary.allergies.length > 0 && (
          <Box>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px", mb: 1 }}>
              Alergias:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {beneficiary.allergies.map((allergy: string, index: number) => (
                <Typography
                  component="li"
                  key={index}
                  sx={{ color: theme.textDark, fontSize: "14px", mb: 0.5 }}
                >
                  {allergy}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Caso não tenha histórico */}
        {(!beneficiary.conditions || beneficiary.conditions.length === 0) &&
         (!beneficiary.medications || beneficiary.medications.length === 0) &&
         (!beneficiary.allergies || beneficiary.allergies.length === 0) && (
          <Typography sx={{ color: theme.textMuted, fontSize: "14px", fontStyle: "italic" }}>
            Nenhum histórico médico registrado
          </Typography>
        )}
      </Box>
    </Box>
  );
}