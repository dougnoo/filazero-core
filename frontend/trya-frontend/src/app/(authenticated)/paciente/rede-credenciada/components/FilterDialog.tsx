"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";

export const DISTANCE_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
  { value: 500, label: "500 km" },
  { value: 1000, label: "1000 km" },
];

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  distanceKm: number;
  onApply: (filters: { distanceKm: number }) => void;
}

export function FilterDialog({ open, onClose, distanceKm, onApply }: FilterDialogProps) {
  const [localDistance, setLocalDistance] = useState(distanceKm);

  const handleApply = () => {
    onApply({ distanceKm: localDistance });
    onClose();
  };

  const handleReset = () => {
    setLocalDistance(50);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Filtros</Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Distância máxima</InputLabel>
            <Select
              value={localDistance}
              label="Distância máxima"
              onChange={(e) => setLocalDistance(e.target.value as number)}
              sx={{ borderRadius: "10px" }}
            >
              {DISTANCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
        >
          Limpar
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
