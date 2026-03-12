"use client";

import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useState } from "react";

interface FAQChatInputProps {
  onSendMessage: (message: string) => void;
}

// Ícone de Enviar personalizado
const SendIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4425_8230)">
      <path d="M5.82004 11L8.00004 13.17C8.13379 13.3071 8.30102 13.4069 8.48518 13.4595C8.66934 13.5121 8.86405 13.5158 9.05004 13.47C9.23719 13.4265 9.41 13.3356 9.55185 13.206C9.69371 13.0764 9.79984 12.9125 9.86003 12.73L13.44 2.00002C13.5147 1.79897 13.5302 1.5807 13.4844 1.37114C13.4387 1.16159 13.3338 0.969571 13.1821 0.817909C13.0305 0.666247 12.8385 0.561322 12.6289 0.515606C12.4194 0.46989 12.2011 0.485305 12 0.56002L1.27004 4.14002C1.08129 4.20449 0.913177 4.3182 0.783083 4.46939C0.652989 4.62058 0.565631 4.80377 0.530035 5.00002C0.493294 5.17851 0.501473 5.36333 0.553837 5.53788C0.606202 5.71243 0.70111 5.87123 0.830035 6.00002L3.57003 8.74002L3.48004 12.21L5.82004 11Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.1201 0.780029L3.57007 8.74003" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_4425_8230">
        <rect width="14" height="14" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export function FAQChatInput({ onSendMessage }: FAQChatInputProps) {
  const theme = useThemeColors();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: theme.white,
        p: 2,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Escreva sua mensagem"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Box
                component="button"
                onClick={handleSend}
                disabled={!message.trim()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: theme.primary,
                  color: theme.white,
                  height: 40,
                  px: 2,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: theme.fontFamily,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  "&:hover": { 
                    opacity: 0.9,
                  },
                  "&:disabled": {
                    bgcolor: "#E0E0E0",
                    color: "#4A6060",
                    cursor: "not-allowed",
                    opacity: 1,
                  },
                }}
              >
                <SendIcon color={!message.trim() ? "#4A6060" : theme.white} />
                Enviar
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            fontFamily: theme.fontFamily,
            paddingRight: "14px",
            "& fieldset": {
              borderColor: "#E0E0E0",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: "#BDBDBD",
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.primary,
              borderWidth: "1px",
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "14px",
            fontFamily: theme.fontFamily,
            fontWeight: 400,
            color: theme.textDark,
            padding: "16px",
            "&::placeholder": {
              color: theme.textMuted,
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
}

