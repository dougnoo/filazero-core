import { Box, Typography, Divider, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { usePatientHistory } from "../../hooks/usePatientHistory";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface PreviousEvaluationsProps {
  patientId?: string;
  currentSessionId?: string;
}

export function PreviousEvaluations({
  patientId,
  currentSessionId,
}: PreviousEvaluationsProps) {
  const theme = useTheme();
  const router = useRouter();
  const { history, loading, error } = usePatientHistory(patientId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleNavigate = (evaluationId: string) => {
    router.push(`/medico/avaliacoes/${evaluationId}`);
  };

  // Don't render if loading, error, or no patient ID
  if (!patientId || error) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "18px",
             
            mb: 2,
          }}
        >
          Avaliações anteriores
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      </Box>
    );
  }

  // Filter out current evaluation and sort by date (most recent first)
  const previousEvaluations = history
    .filter((item) => item.sessionId !== currentSessionId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (previousEvaluations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "18px",
           
          mb: 2,
        }}
      >
        Avaliações anteriores
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {previousEvaluations.map((evaluation) => (
          <Box
            key={evaluation.id}
            onClick={() => handleNavigate(evaluation.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: "8px",
              border: `1px solid #E0E0E0`,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: "action.hover",
              "&:hover": {
                backgroundColor: "#F5F5F5",
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                   
                  mb: 0.5,
                }}
              >
                Triagem automática
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                   
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {evaluation.chiefComplaint}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "grey.800",
                }}
              >
                {formatDate(evaluation.createdAt)}
              </Typography>
            </Box>
            <ChevronRightIcon
              sx={{
                fontSize: 20,
                color: "grey.800",
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
