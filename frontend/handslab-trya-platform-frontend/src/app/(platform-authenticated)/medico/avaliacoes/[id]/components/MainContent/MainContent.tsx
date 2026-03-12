import { Box, Typography, Button, Chip, Divider, Paper } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { AttachmentsList } from "@/shared/components/AttachmentsList";
import { ErrorState } from "@/shared/components/ErrorState";
import { MainContentSkeleton } from "./MainContentSkeleton";
import {
  STATUS_DISPLAY_MAP,
  STATUS_COLOR_MAP,
  URGENCY_DISPLAY_MAP,
  URGENCY_COLOR_MAP,
} from "../../../../constants";
import type {
  MedicalApprovalRequest,
  AttachmentDetails,
} from "../../../../types";

interface MainContentProps {
  medicalApprovalRequest?: MedicalApprovalRequest;
  attachments?: AttachmentDetails[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onDownload?: (attachment: AttachmentDetails) => void;
  onView?: (attachment: AttachmentDetails) => void;
  onApprove?: () => void;
  onApproveWithAdjustments?: () => void;
}

export function MainContent({
  medicalApprovalRequest,
  attachments = [],
  loading = false,
  error,
  onRetry,
  onDownload,
  onView,
  onApprove,
  onApproveWithAdjustments,
}: MainContentProps) {
  const theme = useThemeColors();

  return (
    <Paper
      sx={{
        bgcolor: "white",
        borderRadius: "12px",
        p: 3,
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)"
      }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Header com Status - sempre visível */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "24px",
              color: theme.textDark,
            }}
          >
            Resumo
          </Typography>
          {medicalApprovalRequest && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={
                  STATUS_DISPLAY_MAP[
                    medicalApprovalRequest.status as keyof typeof STATUS_DISPLAY_MAP
                  ]
                }
                sx={{
                  ...STATUS_COLOR_MAP[
                    medicalApprovalRequest.status as keyof typeof STATUS_COLOR_MAP
                  ],
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              />
              {medicalApprovalRequest.urgencyLevel && (
                <Chip
                  label={
                    URGENCY_DISPLAY_MAP[
                      medicalApprovalRequest.urgencyLevel as keyof typeof URGENCY_DISPLAY_MAP
                    ]
                  }
                  sx={{
                    ...URGENCY_COLOR_MAP[
                      medicalApprovalRequest.urgencyLevel as keyof typeof URGENCY_COLOR_MAP
                    ],
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                />
              )}
            </Box>
          )}
          
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content - condicional baseado no estado */}
        {loading ? (
          <MainContentSkeleton />
        ) : error ? (
            <ErrorState
              title="Erro ao carregar dados da solicitação"
              message={error}
              onRetry={onRetry}
              variant="contained"
              size="large"
            />
        ) : medicalApprovalRequest ? (
          <MainContentData
            medicalApprovalRequest={medicalApprovalRequest}
            attachments={attachments}
            onDownload={onDownload}
            onView={onView}
            onApprove={onApprove}
            onApproveWithAdjustments={onApproveWithAdjustments}
          />
        ) : null}
      </Box>
    </Paper>
  );
}

// Componente separado para o conteúdo dos dados
interface MainContentDataProps {
  medicalApprovalRequest: MedicalApprovalRequest;
  attachments: AttachmentDetails[];
  onDownload?: (attachment: AttachmentDetails) => void;
  onView?: (attachment: AttachmentDetails) => void;
  onApprove?: () => void;
  onApproveWithAdjustments?: () => void;
}

function MainContentData({
  medicalApprovalRequest,
  attachments,
  onDownload,
  onView,
  onApprove,
  onApproveWithAdjustments,
}: MainContentDataProps) {
  const theme = useThemeColors();

  return (
    <>
      {/* Queixa Principal */}
      {medicalApprovalRequest.chiefComplaint && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: theme.textDark,
                mb: 2,
              }}
            >
              Queixa Principal
            </Typography>
            <Typography sx={{ color: theme.textDark, lineHeight: 1.6 }}>
              {medicalApprovalRequest.chiefComplaint}
            </Typography>
          </Box>
        </>
      )}

      {/* Início da Interação */}
      {medicalApprovalRequest.conversationSummary && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: theme.textDark,
                mb: 2,
              }}
            >
              Início da interação
            </Typography>
            <Typography sx={{ color: theme.textDark, lineHeight: 1.6 }}>
              {medicalApprovalRequest.conversationSummary}
            </Typography>
          </Box>
        </>
      )}

      {/* Análise inicial da IA */}
      {medicalApprovalRequest.imageAnalysis && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: theme.textDark,
                mb: 2,
              }}
            >
              Análise inicial da IA
            </Typography>
            <Typography sx={{ color: theme.textDark, lineHeight: 1.6 }}>
              {medicalApprovalRequest.imageAnalysis}
            </Typography>
          </Box>
        </>
      )}

      {/* Envio de exames */}
      {medicalApprovalRequest.symptoms &&
        medicalApprovalRequest.symptoms.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "16px",
                  color: theme.textDark,
                  mb: 2,
                }}
              >
                Envio de exames
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {medicalApprovalRequest.symptoms.map(
                  (symptom: string, index: number) => (
                    <Typography
                      component="li"
                      key={index}
                      sx={{ color: theme.textDark, mb: 0.5 }}
                    >
                      {symptom}
                    </Typography>
                  )
                )}
              </Box>
            </Box>
          </>
        )}

      {/* Recomendação automática gerada pela IA */}
      {medicalApprovalRequest.careRecommendation && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "20px",
                color: theme.textDark,
                mb: 2,
              }}
            >
              Recomendação automática gerada pela IA
            </Typography>

            <Divider sx={{ mb: 3 }} />
            <Typography sx={{ color: theme.textDark, lineHeight: 1.6, mb: 2 }}>
              Com base nos dados relatados e exames enviados, a IA sugere:
            </Typography>
            <Typography sx={{ color: theme.textDark, lineHeight: 1.6 }}>
              {medicalApprovalRequest.careRecommendation}
            </Typography>
            {medicalApprovalRequest.suggestedExams &&
              medicalApprovalRequest.suggestedExams.length > 0 && (
                <Box component="ul" sx={{ pl: 2, mt: 2, m: 0 }}>
                  {medicalApprovalRequest.suggestedExams.map(
                    (exam: string, index: number) => (
                      <Typography
                        component="li"
                        key={index}
                        sx={{ color: theme.textDark, mb: 0.5 }}
                      >
                        {exam}
                      </Typography>
                    )
                  )}
                </Box>
              )}
          </Box>
        </>
      )}
      <AttachmentsList
        attachments={attachments}
        onDownload={onDownload}
        onView={onView}
      />

      {/* Botões de Ação */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={onApproveWithAdjustments}
          sx={{
            textTransform: "none",
            borderColor: theme.primary,
            color: theme.primary,
            px: 4,
            fontWeight: 500,
          }}
        >
          Aprovar com ajustes
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={onApprove}
          sx={{
            textTransform: "none",
            bgcolor: theme.textDark,
            color: "white",
            px: 4,
            fontWeight: 500,
            "&:hover": {
              bgcolor: theme.textDark,
              opacity: 0.9,
            },
          }}
        >
          Aprovar
        </Button>
      </Box>
    </>
  );
}
