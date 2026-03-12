import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BOARD_CODE_OPTIONS, BoardCode } from "@/shared/types/medical";
import { SyncMemedRequest, SyncMemedResponse } from "@/app/(platform-authenticated)/medico/types/memed";
import { memedService } from "@/shared/services/memedService";
import { BRAZILIAN_STATES } from "@/shared/types/general";

interface MemedSyncModalProps {
  open: boolean;
  onClose: () => void;
  doctorId: string;
  initialData?: {
    boardCode?: BoardCode;
    boardNumber?: string;
    boardState?: string;
  };
  onSyncSuccess: (response: SyncMemedResponse) => void;
}

export function MemedSyncModal({
  open,
  onClose,
  doctorId,
  initialData,
  onSyncSuccess,
}: MemedSyncModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [boardCode, setBoardCode] = useState<BoardCode>(
    initialData?.boardCode || BoardCode.CRM
  );
  const [boardNumber, setBoardNumber] = useState(
    initialData?.boardNumber || ""
  );
  const [boardState, setBoardState] = useState(initialData?.boardState || "");
  const [cityId, setCityId] = useState<number | "">("");
  const [specialtyId, setSpecialtyId] = useState<number | "">("");

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!boardNumber.trim()) {
      setError("Número do registro é obrigatório");
      return;
    }

    if (!boardState) {
      setError("Estado do conselho é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const syncData: SyncMemedRequest = {
        doctorId,
        boardCode,
        boardNumber: boardNumber.trim(),
        boardState,
        ...(cityId && { cityId: Number(cityId) }),
        ...(specialtyId && { specialtyId: Number(specialtyId) }),
      };

      const response = await memedService.syncDoctor(syncData);
      onSyncSuccess(response);
      handleClose();
    } catch (err) {
      console.error("Error syncing with Memed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao sincronizar com Memed. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "20px",
          fontWeight: 700,
           
          pb: 2,
        }}
      >
        Sincronizar com Memed
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Typography
          sx={{
            fontSize: "14px",
            color: "grey.800",
            mb: 3,
            lineHeight: 1.5,
          }}
        >
          Para prescrever medicamentos e exames através da plataforma Memed,
          precisamos das informações do seu conselho profissional.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Board Code */}
          <FormControl fullWidth>
            <InputLabel>Conselho Profissional *</InputLabel>
            <Select
              value={boardCode}
              onChange={(e) => setBoardCode(e.target.value as BoardCode)}
              label="Conselho Profissional *"
              disabled={isLoading}
              sx={{
                borderRadius: "8px",
              }}
            >
              {BOARD_CODE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Board Number */}
          <TextField
            fullWidth
            label="Número do Registro *"
            value={boardNumber}
            onChange={(e) => setBoardNumber(e.target.value)}
            placeholder="Ex: 123456"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          {/* Board State */}
          <FormControl fullWidth>
            <InputLabel>Estado do Conselho *</InputLabel>
            <Select
              value={boardState}
              onChange={(e) => setBoardState(e.target.value)}
              label="Estado do Conselho *"
              disabled={isLoading}
              sx={{
                borderRadius: "8px",
              }}
            >
              {BRAZILIAN_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* City (Optional) */}
          <FormControl fullWidth>
            <InputLabel>Cidade (Opcional)</InputLabel>
            <Select
              value={cityId}
              onChange={(e) => setCityId(e.target.value as number | "")}
              label="Cidade (Opcional)"
              disabled={isLoading}
              sx={{
                borderRadius: "8px",
              }}
            >
              <MenuItem value="">
                <em>Selecione uma cidade</em>
              </MenuItem>
              {/* Empty for now as requested */}
            </Select>
          </FormControl>

          {/* Specialty (Optional) */}
          <FormControl fullWidth>
            <InputLabel>Especialidade (Opcional)</InputLabel>
            <Select
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value as number | "")}
              label="Especialidade (Opcional)"
              disabled={isLoading}
              sx={{
                borderRadius: "8px",
              }}
            >
              <MenuItem value="">
                <em>Selecione uma especialidade</em>
              </MenuItem>
              {/* Empty for now as requested */}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          color="error"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Sincronizando...
            </Box>
          ) : (
            "Sincronizar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
