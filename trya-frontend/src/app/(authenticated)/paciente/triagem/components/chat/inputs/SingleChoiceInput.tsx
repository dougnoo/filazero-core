"use client";

import { Box, Typography, Button } from "@mui/material";
import { useState, useCallback } from "react";

interface SingleChoiceInputProps {
  content: string;           // Pergunta a ser exibida
  timestamp: string;
  options?: string[];        // Opções dinâmicas do backend (ex: ["Sim, alivia completamente", "Alivia um pouco", ...])
  onSelect: (value: string) => void;  // Passa o texto da opção selecionada
  disabled?: boolean;
  selectedValue?: string;    // Texto da opção selecionada
}

export function SingleChoiceInput({
  content,
  timestamp,
  options,
  onSelect,
  disabled = false,
  selectedValue,
}: SingleChoiceInputProps) {
  const [localSelectedValue, setLocalSelectedValue] = useState<string | undefined>(selectedValue);
  
  const currentValue = selectedValue ?? localSelectedValue;
  const isDisabled = disabled || currentValue !== undefined;

  const displayOptions = options && options.length > 0 ? options : ["Sim", "Não"];

  const handleSelect = useCallback((option: string) => {
    if (isDisabled) return;
    setLocalSelectedValue(option);
    onSelect(option);
  }, [isDisabled, onSelect]);

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
        role="group"
        aria-label="Escolha uma opção"
        sx={{
          display: "flex",
          gap: { xs: 1, md: 1.5 },
          flexWrap: "wrap",
          justifyContent: { xs: "flex-end", md: "flex-start" },
        }}
      >
        {displayOptions.map((option, index) => {
          const isSelected = currentValue === option || 
            (currentValue && option.toLowerCase().includes(currentValue.toLowerCase()));
          
          return (
            <Button
              key={option}
              aria-pressed={isSelected ? true : false}
              aria-label={option}
              disabled={isDisabled && !isSelected}
              onClick={() => handleSelect(option)}
              variant="contained"
            >
              {option}
            </Button>
          );
        })}
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
