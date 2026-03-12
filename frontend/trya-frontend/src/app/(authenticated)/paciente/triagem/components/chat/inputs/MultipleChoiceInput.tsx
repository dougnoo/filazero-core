"use client";

import { Box, Typography, Button, Checkbox, TextField } from "@mui/material";
import { useState, useCallback, useRef } from "react";

interface MultipleChoiceInputProps {
  content: string;           // Pergunta a ser exibida
  options: string[];         // Opções disponíveis
  timestamp: string;
  onConfirm: (values: string[]) => void;
  disabled?: boolean;
  selectedValues?: string[];
}

export function MultipleChoiceInput({
  content,
  options,
  timestamp,
  onConfirm,
  disabled = false,
  selectedValues,
}: MultipleChoiceInputProps) {
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(selectedValues ?? []);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(selectedValues !== undefined && selectedValues.length > 0);
  const [otherText, setOtherText] = useState<string>("");
  const [triedConfirm, setTriedConfirm] = useState<boolean>(false);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Detecta se existe opção "Outro" ou "Outros" na lista
  const otherOption = options.find((o) => /^outros?$/i.test(o.trim()));

  const currentValues = selectedValues ?? localSelectedValues;
  const isDisabled = disabled || isConfirmed;
  const isOtherSelected = otherOption ? currentValues.includes(otherOption) : false;

  // Bloqueia confirmação se "Outro(s)" estiver selecionado mas sem texto
  const hasSelections = currentValues.length > 0 && (!isOtherSelected || otherText.trim().length > 0);

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    if (isDisabled) return;
    
    setLocalSelectedValues((prev) => {
      if (checked) {
        return [...prev, option];
      } else {
        return prev.filter((v) => v !== option);
      }
    });

    // Foca no campo de texto ao selecionar "Outro(s)"
    if (checked && otherOption && option === otherOption) {
      setTimeout(() => otherInputRef.current?.focus(), 50);
    }
  }, [isDisabled, otherOption]);

  const handleConfirm = useCallback(() => {
    if (isDisabled) return;
    if (!hasSelections) {
      setTriedConfirm(true);
      return;
    }
    setIsConfirmed(true);

    // Substitui o label "Outro(s)" pelo texto digitado no array final
    const finalValues = currentValues.map((v) =>
      otherOption && v === otherOption ? otherText.trim() : v
    );
    onConfirm(finalValues);
  }, [isDisabled, hasSelections, currentValues, otherOption, otherText, onConfirm]);

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
        aria-label="Selecione uma ou mais opções"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.5, md: 1 },
          mb: 2,
        }}
      >
        {options.map((option, index) => {
          const isChecked = currentValues.includes(option);
          const checkboxId = `multiple-choice-option-${index}`;
          
          const isOtherOption = otherOption && option === otherOption;

          return (
            <Box key={option}>
              <Box
                onClick={() => {
                  if (!isDisabled) {
                    handleCheckboxChange(option, !isChecked);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mx: 0,
                  py: { xs: 0.25, md: 0.5 },
                  px: 1,
                  borderRadius: "8px",
                  cursor: isDisabled ? "default" : "pointer",
                  transition: "background-color 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isDisabled ? undefined : "grey.50",
                  },
                }}
              >
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  disabled={isDisabled}
                  tabIndex={-1}
                  sx={{
                    pointerEvents: "none",
                    color: isDisabled && isChecked ? "primary.main" : undefined,
                    "&.Mui-checked": { color: "primary.main" },
                    "&.Mui-disabled.Mui-checked": { color: "primary.main" },
                  }}
                  slotProps={{ input: { "aria-label": option } }}
                />

                {isOtherOption ? (
                  /* Label + input inline para "Outro(s)" */
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "13px", md: "14px" },
                        fontWeight: 400,
                        color: isDisabled && isChecked ? "primary.main" : isDisabled ? "grey.500" : "text.primary",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {option}
                    </Typography>
                    <TextField
                      inputRef={otherInputRef}
                      value={otherText}
                      variant="standard"
                      onChange={(e) => setOtherText(e.target.value)}
                      disabled={isDisabled}
                      placeholder="Descreva aqui..."
                      size="small"
                      error={triedConfirm && isOtherSelected && otherText.trim().length === 0}
                      helperText={
                        triedConfirm && isOtherSelected && otherText.trim().length === 0
                          ? "Por favor, descreva o valor para continuar."
                          : undefined
                      }
                      sx={{
                        flex: 1,
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "13px", md: "14px" },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontSize: { xs: "13px", md: "14px" },
                      fontWeight: 400,
                      color: isDisabled && isChecked ? "primary.main" : isDisabled ? "grey.500" : "text.primary",
                      userSelect: "none",
                    }}
                  >
                    {option}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-start" },
        }}
      >
        <Button
          aria-label="Confirmar Escolhas"
          disabled={isDisabled || !hasSelections}
          onClick={handleConfirm}
          variant="contained"          
        >
          Confirmar Escolhas
        </Button>
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
