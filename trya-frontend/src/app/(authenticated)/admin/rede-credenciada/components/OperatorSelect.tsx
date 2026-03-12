"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  CircularProgress,
  FormHelperText,
  Chip,
  Box,
} from "@mui/material";
import type { HealthOperator } from "../services/networkImportService";

interface OperatorSelectProps {
  operators: HealthOperator[];
  selectedId: string;
  onChange: (id: string) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function OperatorSelect({
  operators,
  selectedId,
  onChange,
  loading = false,
  error,
  disabled = false,
}: OperatorSelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const getStatusChip = (status: HealthOperator["status"]) => {
    if (status === "REDE_CREDENCIADA_DISPONIVEL") {
      return (
        <Chip
          label="Rede disponível"
          size="small"
          color="success"
          sx={{ ml: 1 }}
        />
      );
    }
    return (
      <Chip
        label="Cadastrada"
        size="small"
        color="default"
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <FormControl fullWidth error={!!error} disabled={disabled || loading}>
      <InputLabel id="operator-select-label">Operadora</InputLabel>
      <Select
        labelId="operator-select-label"
        id="operator-select"
        value={selectedId}
        label="Operadora"
        onChange={handleChange}
        endAdornment={loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
      >
        {operators.map((op) => (
          <MenuItem key={op.id} value={op.id}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span>{op.name}</span>
              {getStatusChip(op.status)}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
