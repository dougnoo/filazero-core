"use client";

import { Box, Typography, Button } from "@mui/material";
import { useState, useCallback } from "react";

// Constantes de cores por faixa conforme design.md
const SCALE_COLORS = {
  LOW: ['#4CAF50', '#66BB6A', '#81C784'] as const,      // 1-3: Verde
  MEDIUM: ['#FFC107', '#FFB300', '#FF9800'] as const,   // 4-6: Amarelo/Laranja
  HIGH: ['#FF5722', '#F44336', '#D32F2F', '#C62828'] as const // 7-10: Laranja/Vermelho
} as const;

const SCALE_LABELS = {
  MIN: 'Leve',
  MAX: 'Insuportável'
} as const;

function getColorForValue(value: number): string {
  if (value >= 1 && value <= 3) {
    return SCALE_COLORS.LOW[value - 1];
  }
  if (value >= 4 && value <= 6) {
    return SCALE_COLORS.MEDIUM[value - 4];
  }
  if (value >= 7 && value <= 10) {
    return SCALE_COLORS.HIGH[value - 7];
  }
  return SCALE_COLORS.LOW[0]; // fallback
}

interface ScaleInputProps {
  content: string;           // Pergunta a ser exibida
  timestamp: string;
  onSelect: (value: number) => void;
  disabled?: boolean;
  selectedValue?: number;
}

export function ScaleInput({
  content,
  timestamp,
  onSelect,
  disabled = false,
  selectedValue,
}: ScaleInputProps) {
  const [localSelectedValue, setLocalSelectedValue] = useState<number | undefined>(selectedValue);
  
  const currentValue = selectedValue ?? localSelectedValue;
  const isDisabled = disabled || currentValue !== undefined;

  const handleSelect = useCallback((value: number) => {
    if (isDisabled) return;
    setLocalSelectedValue(value);
    onSelect(value);
  }, [isDisabled, onSelect]);

  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: { xs: "10px", md: "12px" },
        p: { xs: 1.5, md: 2 },
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "13px", md: "14px" },
          fontWeight: 400,
          lineHeight: { xs: "18px", md: "20px" },
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          mb: 2,
        }}
      >
        {content}
      </Typography>

      <Box
        role="radiogroup"
        aria-label="Escala de intensidade de 1 a 10"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {/* Desktop: single row */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 0.75,
            width: "100%",
          }}
        >
          {scaleValues.map((value) => {
            const isSelected = currentValue === value;
            const buttonColor = getColorForValue(value);
            
            return (
              <Button
                key={value}
                role="radio"
                aria-checked={isSelected}
                aria-label={`Intensidade ${value}`}
                disabled={isDisabled && !isSelected}
                onClick={() => handleSelect(value)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  borderRadius: "8px",
                  p: 0,
                  fontSize: "14px",
                  fontWeight: 600,
                  bgcolor: buttonColor,
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: isSelected ? `0 0 0 3px ${buttonColor}40` : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: buttonColor,
                    opacity: isDisabled ? 1 : 0.85,
                    transform: isDisabled ? undefined : "scale(1.05)",
                  },
                  "&:focus": {
                    outline: `2px solid ${buttonColor}`,
                    outlineOffset: "2px",
                  },
                  "&.Mui-disabled": {
                    bgcolor: buttonColor,
                    color: "#FFFFFF",
                    opacity: isSelected ? 1 : 0.5,
                  },
                }}
              >
                {value}
              </Button>
            );
          })}
        </Box>

        {/* Mobile: two rows of 5 */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 0.75,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {scaleValues.slice(0, 5).map((value) => {
              const isSelected = currentValue === value;
              const buttonColor = getColorForValue(value);
              
              return (
                <Button
                  key={value}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Intensidade ${value}`}
                  disabled={isDisabled && !isSelected}
                  onClick={() => handleSelect(value)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    height: 44,
                    borderRadius: "8px",
                    p: 0,
                    fontSize: "14px",
                    fontWeight: 600,
                    bgcolor: buttonColor,
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: isSelected ? `0 0 0 3px ${buttonColor}40` : "none",
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-disabled": {
                      bgcolor: buttonColor,
                      color: "#FFFFFF",
                      opacity: isSelected ? 1 : 0.5,
                    },
                  }}
                >
                  {value}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {scaleValues.slice(5, 10).map((value) => {
              const isSelected = currentValue === value;
              const buttonColor = getColorForValue(value);
              
              return (
                <Button
                  key={value}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Intensidade ${value}`}
                  disabled={isDisabled && !isSelected}
                  onClick={() => handleSelect(value)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    height: 44,
                    borderRadius: "8px",
                    p: 0,
                    fontSize: "14px",
                    fontWeight: 600,
                    bgcolor: buttonColor,
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: isSelected ? `0 0 0 3px ${buttonColor}40` : "none",
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-disabled": {
                      bgcolor: buttonColor,
                      color: "#FFFFFF",
                      opacity: isSelected ? 1 : 0.5,
                    },
                  }}
                >
                  {value}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "11px", md: "12px" },
              fontWeight: 400,
              color: "grey.500",
            }}
          >
            {SCALE_LABELS.MIN}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "11px", md: "12px" },
              fontWeight: 400,
              color: "grey.500",
            }}
          >
            {SCALE_LABELS.MAX}
          </Typography>
        </Box>
      </Box>

      {timestamp && (
        <Typography
          sx={{
            fontSize: { xs: "9px", md: "10px" },
            fontWeight: 400,
            color: "grey.600",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "flex-end",
            mt: { xs: 1, md: 1.5 },
          }}
        >
          {timestamp} ✓✓
        </Typography>
      )}
    </Box>
  );
}
