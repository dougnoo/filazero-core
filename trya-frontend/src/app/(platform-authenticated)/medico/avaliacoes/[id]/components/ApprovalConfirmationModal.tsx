import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { CheckCircle, EditNote, Close } from "@mui/icons-material";

interface ApprovalConfirmationModalProps {
  open: boolean;
  onApprove: () => void;
  onApproveWithNotes: () => void;
  isApproving?: boolean;
  patientName?: string;
}

export function ApprovalConfirmationModal({
  open,
  onApprove,
  onApproveWithNotes,
  isApproving = false,
  patientName,
}: ApprovalConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle sx={{ color: "success.main", fontSize: 28 }} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "20px",
               
            }}
          >
            Revisão do atendimento
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography
          sx={{
             
            fontSize: "16px",
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          A prescrição foi criada com sucesso para{" "}
          <strong>{patientName || "o paciente"}</strong>.
        </Typography>

        <Typography
          sx={{
            color: "grey.800",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Como você avalia a sugestão da AI para este atendimento?
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: "column",
          gap: 2,
          p: 3,
          pt: 0,
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onApprove}
          disabled={isApproving}
          startIcon={<CheckCircle />}
          color="success"
          sx={{
            textTransform: "none",
            py: 1.5,
            fontWeight: 600,
            fontSize: "16px",
            "&:disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {isApproving ? "Finalizando..." : "Aprovado sem ajustes"}
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={onApproveWithNotes}
          disabled={isApproving}
          startIcon={<EditNote />}
          color="primary"
          sx={{
            textTransform: "none",
            py: 1.5,
            fontWeight: 600,
            fontSize: "16px",
            "&:disabled": {
              borderColor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {isApproving ? "Finalizando..." : "Aprovado com ajustes"}
        </Button>

        <Typography
          sx={{
            color: "grey.800",
            fontSize: "12px",
            textAlign: "center",
            mt: 1,
          }}
        >
          Escolha uma das opções para continuar
        </Typography>
      </DialogActions>
    </Dialog>
  );
}