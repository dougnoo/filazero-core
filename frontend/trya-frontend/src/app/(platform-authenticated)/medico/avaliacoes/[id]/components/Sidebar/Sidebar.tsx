import { Box, Typography, Paper, Divider, Button, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ErrorState } from "@/shared/components/ErrorState";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { PreviousEvaluations } from "./PreviousEvaluations";
import { anonymizeCPF } from "@/shared/utils/anonymize";
import type {
  BeneficiaryDetails,
  MedicalApprovalRequest,
} from "../../../../types";
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
  onRetry,
}: SidebarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/medico");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: "18px" }} />}
        onClick={handleBack}
        variant="contained"
        color="inherit"
        sx={{
           
          backgroundColor: "#FFFFFF",
          boxShadow: "none",
          textAlign: "left",
          fontSize: "14px",
          fontWeight: 400,
          textTransform: "none",
          px: 2,
          minWidth: "auto",
          justifyContent: "flex-start",
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

function SidebarContent({
  beneficiary,
  medicalApprovalRequest,
  loading,
}: SidebarContentProps) {
  if (loading) {
    return <SidebarSkeleton />;
  }

  if (!beneficiary || !medicalApprovalRequest) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Patient Header with Avatar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "#E0F7FA",
            color: "#00695C",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          {getInitials(beneficiary.name)}
        </Avatar>
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "18px",
               
              lineHeight: 1.2,
            }}
          >
            {beneficiary.name}
          </Typography>
          <Typography
            sx={{
              color: "grey.800",
              fontSize: "14px",
            }}
          >
            {beneficiary.healthPlan.name}
          </Typography>
        </Box>
      </Box>

      {/* Card Number and Time */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <CreditCardIcon sx={{ fontSize: 16, color: "grey.800" }} />
          <Typography sx={{ color: "grey.800", fontSize: "14px" }}>
            Carteirinha nº {beneficiary.healthPlan?.cardNumber}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: "grey.800" }} />
          <Typography sx={{ color: "grey.800", fontSize: "14px" }}>
            Incluído na fila às {formatTime(medicalApprovalRequest.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Personal Information */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{   fontSize: "14px", fontWeight: 500 }}
            >
              CPF:
            </Typography>
            <Typography sx={{   fontSize: "14px" }}>
              {anonymizeCPF(beneficiary.cpf)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{   fontSize: "14px", fontWeight: 500 }}
            >
              Nascimento:
            </Typography>
            <Typography sx={{   fontSize: "14px" }}>
              {beneficiary.birthDate}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{   fontSize: "14px", fontWeight: 500 }}
            >
              Telefone:
            </Typography>
            <Typography sx={{   fontSize: "14px" }}>
              {beneficiary.phone}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{   fontSize: "14px", fontWeight: 500 }}
            >
              Gênero:
            </Typography>
            <Typography sx={{   fontSize: "14px" }}>
              {beneficiary.gender || "-"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Histórico Médico */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "18px",
             
            mb: 3,
          }}
        >
          Histórico médico
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Condições */}
        {beneficiary.chronicConditions &&
          beneficiary.chronicConditions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                   
                  fontSize: "16px",
                  fontWeight: 500,
                  mb: 1.5,
                }}
              >
                Condições
              </Typography>
              <Box sx={{ pl: 0 }}>
                {beneficiary.chronicConditions.map((condition) => (
                  <Typography
                    key={condition.name}
                    sx={{
                       
                      fontSize: "14px",
                      mb: 0.5,
                      lineHeight: 1.4,
                    }}
                  >
                    - {condition.name}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

        {/* Medicamentos */}
        {beneficiary.medications && beneficiary.medications.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: "grey.800",
                fontSize: "16px",
                fontWeight: 500,
                mb: 1.5,
              }}
            >
              Medicamentos
            </Typography>
            <Box sx={{ pl: 0 }}>
              {beneficiary.medications?.map((medication, index: number) => (
                <Typography
                  key={index}
                  sx={{
                     
                    fontSize: "14px",
                    mb: 0.5,
                    lineHeight: 1.4,
                  }}
                >
                  - {medication.name} {medication.dosage}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Alergias */}
        {beneficiary.allergies && beneficiary.allergies.trim() !== "" && (
          <Box>
            <Typography
              sx={{
                 
                fontSize: "16px",
                fontWeight: 500,
                mb: 1.5,
              }}
            >
              Alergias
            </Typography>
            <Box sx={{ pl: 0 }}>
              <Typography
                sx={{
                   
                  fontSize: "14px",
                  mb: 0.5,
                  lineHeight: 1.4,
                }}
              >
                - {beneficiary.allergies}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Caso não tenha histórico */}
        {(!beneficiary.chronicConditions ||
          beneficiary.chronicConditions.length === 0) &&
          (!beneficiary.medications || beneficiary.medications.length === 0) &&
          (!beneficiary.allergies || beneficiary.allergies.trim() === "") && (
            <Typography
              sx={{
                color: "grey.800",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Nenhum histórico médico registrado
            </Typography>
          )}
      </Box>

      {/* Avaliações Anteriores */}
      <PreviousEvaluations
        patientId={medicalApprovalRequest?.userId}
        currentSessionId={medicalApprovalRequest?.sessionId}
      />
    </Box>
  );
}
