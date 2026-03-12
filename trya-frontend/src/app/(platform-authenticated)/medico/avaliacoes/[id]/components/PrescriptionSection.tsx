import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import { STATUS_DISPLAY_MAP, STATUS_COLOR_MAP } from "../../../constants/medicalApprovalRequest";
import type { PrescriptionResponse } from "@/shared/services/prescriptionService";
import type { MedicalApprovalRequest } from "../../../types";

interface PrescriptionSectionProps {
  prescription: PrescriptionResponse;
  medicalApprovalRequest: MedicalApprovalRequest;
}

export function PrescriptionSection({
  prescription,
  medicalApprovalRequest,
}: PrescriptionSectionProps) {
  const handleDownloadPDF = () => {
    if (prescription.pdfUrl) {
      window.open(prescription.pdfUrl, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to extract item name from Memed structure
  const getItemName = (item: any, index: number, type: string = "item"): string => {
    if (typeof item === "string") return item;

    return (
      item?.nome ||
      item?.descricao ||
      item?.name ||
      item?.description ||
      `${type} ${index + 1}`
    );
  };

  // Combine medications and exams into a single array
  const getAllItems = () => {
    const items = [];

    if (prescription.medications && prescription.medications.length > 0) {
      items.push(
        ...prescription.medications.map((med, index) => ({
          name: getItemName(med, index, "Medicamento"),
          type: "medication",
        }))
      );
    }

    if (prescription.exams && prescription.exams.length > 0) {
      items.push(
        ...prescription.exams.map((exam, index) => ({
          name: getItemName(exam, index, "Exame"),
          type: "exam",
        }))
      );
    }

    return items;
  };

  const allItems = getAllItems();
  const statusColors = STATUS_COLOR_MAP[medicalApprovalRequest.status];
  const statusLabel = STATUS_DISPLAY_MAP[medicalApprovalRequest.status];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "20px",
           
          mb: 2,
        }}
      >
        Prescrição médica
      </Typography>

      <Paper
        sx={{
          p: 3,
          bgcolor: "#F8FAFC",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Header da Prescrição */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "16px",
                   
                }}
              >
                Prescrição #{prescription.memedPrescriptionId}
              </Typography>

              {/* Status Badge */}
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  bgcolor: statusColors.bgcolor,
                  color: statusColors.color,
                  fontWeight: 600,
                  fontSize: "12px",
                  height: "24px",
                  borderRadius: "6px",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            </Box>

            {prescription.createdAt && (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "grey.800",
                }}
              >
                Criada em {formatDate(prescription.createdAt)}
              </Typography>
            )}

            {/* Notas do Médico */}
            {medicalApprovalRequest.doctorNotes && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#F8F9FA",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "12px",
                     
                    mb: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Considerações do médico
                </Typography>
                <Typography
                  sx={{
                     
                    lineHeight: 1.5,
                    fontSize: "14px",
                  }}
                >
                  {medicalApprovalRequest.doctorNotes}
                </Typography>
              </Box>
            )}
          </Box>

          {prescription.pdfUrl && (
            <Button
              variant="contained"
              size="medium"
              onClick={handleDownloadPDF}
              sx={{
                textTransform: "none",
                bgcolor: "#0F4C5C",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "14px",
                px: 3,
                py: 1,
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#0A3A47",
                  boxShadow: "none",
                },
              }}
            >
              Ver PDF
            </Button>
          )}
        </Box>

        {/* Itens Prescritos */}
        {allItems.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                 
                mb: 1.5,
              }}
            >
              Itens Prescritos ({allItems.length})
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {allItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    bgcolor: "#E0F2F1",
                    color: "#004D40",
                    px: 2,
                    py: 1,
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  {item.name}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Caso não tenha itens prescritos */}
        {allItems.length === 0 && (
          <Typography
            sx={{
              color: "grey.800",
              fontSize: "14px",
              fontStyle: "italic",
              textAlign: "center",
              py: 2,
            }}
          >
            Prescrição criada sem itens específicos
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
