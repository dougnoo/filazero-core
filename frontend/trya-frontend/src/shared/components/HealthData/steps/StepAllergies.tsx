"use client";

import { Box, TextField, Typography } from "@mui/material";

export interface StepAllergiesProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 500;

/**
 * Step 3: Alergias
 * Campo de texto livre para alergias.
 * Suporta pré-preenchimento via value prop.
 *
 * Requirements: 4.4, 7.3
 */
export function StepAllergies({ value, onChange }: StepAllergiesProps) {
  const characterCount = value.length;
  const isOverLimit = characterCount > MAX_LENGTH;

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={6}
        placeholder="Descreva suas alergias..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={isOverLimit}
        helperText={
          isOverLimit
            ? "Texto muito longo"
            : `${characterCount}/${MAX_LENGTH} caracteres`
        }
        slotProps={{
          input: {
            inputProps: {
              maxLength: MAX_LENGTH,
              "aria-label": "Campo de alergias",
            },
          },
        }}
      />
      {!value && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Informe alergias a medicamentos, alimentos ou outras substâncias
        </Typography>
      )}
    </Box>
  );
}
