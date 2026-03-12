import { Box, Typography, Button, Chip, Divider, Paper } from "@mui/material";
import { AttachmentsList } from "@/shared/components/AttachmentsList";
import { ErrorState } from "@/shared/components/ErrorState";
import { MainContentSkeleton } from "./MainContentSkeleton";
import { PrescriptionSection } from "../PrescriptionSection";
import { PrescriptionSkeleton } from "../PrescriptionSkeleton";
import { usePrescription } from "../../hooks/usePrescription";
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
  onStartPrescription?: () => void;
  canApprove?: boolean;
  validationLoading?: boolean;
  memedLoading?: boolean;
}

export function MainContent({
  medicalApprovalRequest,
  attachments = [],
  loading = false,
  error,
  onRetry,
  onDownload,
  onView,
  onStartPrescription,
  canApprove = true,
  validationLoading = false,
  memedLoading = false,
}: MainContentProps) {
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
               
            }}
          >
            Resumo
          </Typography>
          {medicalApprovalRequest && (
            <Box sx={{ display: "flex", gap: 3 }}>
              {medicalApprovalRequest.urgencyLevel && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: URGENCY_COLOR_MAP[
                        medicalApprovalRequest.urgencyLevel as keyof typeof URGENCY_COLOR_MAP
                      ].color,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                       
                    }}
                  >
                    {URGENCY_DISPLAY_MAP[
                      medicalApprovalRequest.urgencyLevel as keyof typeof URGENCY_DISPLAY_MAP
                    ]}
                  </Typography>
                </Box>
              )}
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
            onStartPrescription={onStartPrescription}
            canApprove={canApprove}
            validationLoading={validationLoading}
            memedLoading={memedLoading}
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
  onStartPrescription?: () => void;
  canApprove?: boolean;
  validationLoading?: boolean;
  memedLoading?: boolean;
}

function MainContentData({
  medicalApprovalRequest,
  attachments,
  onDownload,
  onView,
  onStartPrescription,
  canApprove = true,
  validationLoading = false,
  memedLoading = false,
}: MainContentDataProps) {
  // Buscar prescrição se o status for APPROVED ou ADJUSTED
  const shouldFetchPrescription = medicalApprovalRequest.status === 'APPROVED' || medicalApprovalRequest.status === 'ADJUSTED';
  const { prescription, isLoading: prescriptionLoading } = usePrescription(
    shouldFetchPrescription ? medicalApprovalRequest.sessionId : ''
  );

  return (
    <>
      {/* Início da Interação */}
      {medicalApprovalRequest.conversationSummary && (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                 
                mb: 2,
              }}
            >
              Início da interação
            </Typography>
            <Typography sx={{   lineHeight: 1.6 }}>
              {medicalApprovalRequest.conversationSummary}
            </Typography>
          </Box>
        </>
      )}
      {/* Queixa Principal */}
      {medicalApprovalRequest.chiefComplaint && (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                 
                mb: 2,
              }}
            >
              Queixa Principal
            </Typography>
            <Typography sx={{   lineHeight: 1.6 }}>
              {medicalApprovalRequest.chiefComplaint}
            </Typography>
          </Box>
        </>
      )}

      {/* Sintomas */}
      {medicalApprovalRequest.symptoms &&
        medicalApprovalRequest.symptoms.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "16px",
                   
                  mb: 2,
                }}
              >
                Sintomas
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {medicalApprovalRequest.symptoms.map(
                  (symptom: string, index: number) => (
                    <Typography
                      component="li"
                      key={index}
                      sx={{   mb: 0.5}}
                    >
                      - {symptom}
                    </Typography>
                  )
                )}
              </Box>
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
                 
                mb: 2,
              }}
            >
              Análise inicial da IA sobre os anexos enviados
            </Typography>
            <Typography sx={{   lineHeight: 1.6 }}>
              {medicalApprovalRequest.imageAnalysis}
            </Typography>
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
                 
                mb: 2,
              }}
            >
              Recomendação automática gerada pela IA
            </Typography>

            <Divider sx={{ mb: 3 }} />
            <Typography sx={{   lineHeight: 1.6, mb: 2, fontWeight: 600, }}>
              Com base nos dados relatados e exames enviados, a IA sugere:
            </Typography>
            <Typography sx={{   lineHeight: 1.6}}>
              - {medicalApprovalRequest.careRecommendation}
            </Typography>
            <Typography sx={{   lineHeight: 1.6, mt: 2, fontWeight: 600 }}>
              Exames sugeridos:
            </Typography>
            {medicalApprovalRequest.suggestedExams &&
              medicalApprovalRequest.suggestedExams.length > 0 && (
                <Box component="ul" sx={{ pl: 2, mt: 2, m: 0 }}>
                  {medicalApprovalRequest.suggestedExams.map(
                    (exam: string, index: number) => (
                      <Typography
                        component="li"
                        key={index}
                        sx={{   mb: 0.5 }}
                      >
                        - {exam}
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

      {/* Seção de Prescrição - mostrar skeleton durante loading ou prescrição quando carregada */}
      {shouldFetchPrescription && (
        <>
          {prescriptionLoading ? (
            <PrescriptionSkeleton />
          ) : prescription?.memedPrescriptionId ? (
            <PrescriptionSection 
              prescription={prescription} 
              medicalApprovalRequest={medicalApprovalRequest}
            />
          ) : null}
        </>
      )}

      {/* Botão de Ação - apenas mostrar se status não for APPROVED ou ADJUSTED */}
      {medicalApprovalRequest.status !== 'APPROVED' && medicalApprovalRequest.status !== 'ADJUSTED' && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={onStartPrescription}
            disabled={!canApprove || validationLoading || memedLoading}
          >
            {memedLoading ? "Abrindo prescrição..." : validationLoading ? "Verificando..." : "Iniciar Prescrição"}
          </Button>
        </Box>
      )}
    </>
  );
}
