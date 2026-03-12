"use client";

import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile?: () => void;
  onRecordAudio?: () => void;
}

// Ícone de Microfone personalizado
const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4425_8088)">
      <path d="M9.5 6.5C9.5 7.16304 9.23661 7.79893 8.76777 8.26777C8.29893 8.73661 7.66304 9 7 9C6.33696 9 5.70107 8.73661 5.23223 8.26777C4.76339 7.79893 4.5 7.16304 4.5 6.5V3C4.5 2.33696 4.76339 1.70107 5.23223 1.23223C5.70107 0.763392 6.33696 0.5 7 0.5C7.66304 0.5 8.29893 0.763392 8.76777 1.23223C9.23661 1.70107 9.5 2.33696 9.5 3V6.5Z" stroke="#000001" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7C12.0013 7.59132 11.8858 8.17707 11.6602 8.72363C11.4345 9.27019 11.1031 9.76679 10.6849 10.1849C10.2668 10.603 9.77021 10.9345 9.22364 11.1601C8.67708 11.3858 8.09133 11.5013 7.50001 11.5H6.50001C5.90869 11.5013 5.32294 11.3858 4.77638 11.1601C4.22982 10.9345 3.73322 10.603 3.31509 10.1849C2.89696 9.76679 2.56555 9.27019 2.33987 8.72363C2.11419 8.17707 1.99869 7.59132 2.00001 7V7" stroke="#000001" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11.5V13.5" stroke="#000001" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_4425_8088">
        <rect width="14" height="14" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Ícone de Anexar personalizado
const AttachIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.75 11.5V3C10.75 2.33696 10.4866 1.70107 10.0178 1.23223C9.54893 0.763392 8.91304 0.5 8.25 0.5H5.75C5.08696 0.5 4.45107 0.763392 3.98223 1.23223C3.51339 1.70107 3.25 2.33696 3.25 3V11.5C3.25 12.0304 3.46071 12.5391 3.83579 12.9142C4.21086 13.2893 4.71957 13.5 5.25 13.5H6.25C6.78043 13.5 7.28914 13.2893 7.66421 12.9142C8.03929 12.5391 8.25 12.0304 8.25 11.5V4C8.25 3.73478 8.14464 3.48043 7.95711 3.29289C7.76957 3.10536 7.51522 3 7.25 3H6.75C6.48478 3 6.23043 3.10536 6.04289 3.29289C5.85536 3.48043 5.75 3.73478 5.75 4V9.5" stroke="#000001" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Ícone de Enviar personalizado - recebe a cor como prop
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

export function ChatInput({ onSendMessage, onAttachFile, onRecordAudio }: ChatInputProps) {
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
        p: { xs: 1.5, sm: 2 },
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
            <InputAdornment position="end" sx={{ ml: 0 }}>
              <Box sx={{ 
                display: "flex", 
                gap: { xs: 0.5, sm: 1 }, 
                alignItems: "center",
                flexShrink: 0,
              }}>
                <IconButton
                  onClick={onRecordAudio}
                  sx={{
                    bgcolor: "transparent",
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    flexShrink: 0,
                    "&:hover": { 
                      bgcolor: "#F5F5F5",
                    },
                  }}
                >
                  <MicIcon />
                </IconButton>

                <IconButton
                  onClick={onAttachFile}
                  sx={{
                    bgcolor: "transparent",
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    flexShrink: 0,
                    "&:hover": { 
                      bgcolor: "#F5F5F5",
                    },
                  }}
                >
                  <AttachIcon />
                </IconButton>

                <Box
                  component="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 0.5, sm: 1 },
                    bgcolor: theme.primary,
                    color: theme.secondary,
                    height: { xs: 36, sm: 40 },
                    minWidth: { xs: 36, sm: "auto" },
                    px: { xs: 1, sm: 2 },
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "Chivo, sans-serif",
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    "&:hover": { 
                      opacity: 0.9,
                    },
                    "&:disabled": {
                      bgcolor: "#E0E0E0",
                      color: theme.textMuted,
                      cursor: "not-allowed",
                      opacity: 1,
                    },
                  }}
                >
                  <SendIcon color={!message.trim() ? theme.textMuted : theme.secondary} />
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    Enviar
                  </Box>
                </Box>
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            fontFamily: "Chivo, sans-serif",
            paddingRight: { xs: "8px", sm: "14px" },
            alignItems: "flex-end",
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
            padding: { xs: "12px", sm: "16px" },
            minHeight: { xs: "20px", sm: "24px" },
            "&::placeholder": {
              color: theme.textMuted,
              opacity: 1,
            },
          },
          "& .MuiInputAdornment-root": {
            marginBottom: { xs: "4px", sm: "8px" },
            alignSelf: "flex-end",
          },
        }}
      />
    </Box>
  );
}

