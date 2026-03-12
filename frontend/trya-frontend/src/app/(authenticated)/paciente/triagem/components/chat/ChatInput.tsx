"use client";

import { Box, TextField, IconButton, Button } from "@mui/material";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile?: () => void;
  onRecordAudio?: () => void;
  /** Whether the chat is connected. When false, input is disabled. Defaults to true for backward compatibility. */
  isConnected?: boolean;
  /** Whether the chat input is disabled (e.g., when chat is closed). Defaults to false. */
  disabled?: boolean;
  /** Whether the assistant is typing/processing a response. When true, shows waiting message. */
  isTyping?: boolean;
}

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4425_8088)">
      <path d="M9.5 6.5C9.5 7.16304 9.23661 7.79893 8.76777 8.26777C8.29893 8.73661 7.66304 9 7 9C6.33696 9 5.70107 8.73661 5.23223 8.26777C4.76339 7.79893 4.5 7.16304 4.5 6.5V3C4.5 2.33696 4.76339 1.70107 5.23223 1.23223C5.70107 0.763392 6.33696 0.5 7 0.5C7.66304 0.5 8.29893 0.763392 8.76777 1.23223C9.23661 1.70107 9.5 2.33696 9.5 3V6.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7C12.0013 7.59132 11.8858 8.17707 11.6602 8.72363C11.4345 9.27019 11.1031 9.76679 10.6849 10.1849C10.2668 10.603 9.77021 10.9345 9.22364 11.1601C8.67708 11.3858 8.09133 11.5013 7.50001 11.5H6.50001C5.90869 11.5013 5.32294 11.3858 4.77638 11.1601C4.22982 10.9345 3.73322 10.603 3.31509 10.1849C2.89696 9.76679 2.56555 9.27019 2.33987 8.72363C2.11419 8.17707 1.99869 7.59132 2.00001 7V7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11.5V13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_4425_8088">
        <rect width="14" height="14" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const AttachIcon = () => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.75 11.5V3C10.75 2.33696 10.4866 1.70107 10.0178 1.23223C9.54893 0.763392 8.91304 0.5 8.25 0.5H5.75C5.08696 0.5 4.45107 0.763392 3.98223 1.23223C3.51339 1.70107 3.25 2.33696 3.25 3V11.5C3.25 12.0304 3.46071 12.5391 3.83579 12.9142C4.21086 13.2893 4.71957 13.5 5.25 13.5H6.25C6.78043 13.5 7.28914 13.2893 7.66421 12.9142C8.03929 12.5391 8.25 12.0304 8.25 11.5V4C8.25 3.73478 8.14464 3.48043 7.95711 3.29289C7.76957 3.10536 7.51522 3 7.25 3H6.75C6.48478 3 6.23043 3.10536 6.04289 3.29289C5.85536 3.48043 5.75 3.73478 5.75 4V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4425_8230)">
      <path d="M5.82004 11L8.00004 13.17C8.13379 13.3071 8.30102 13.4069 8.48518 13.4595C8.66934 13.5121 8.86405 13.5158 9.05004 13.47C9.23719 13.4265 9.41 13.3356 9.55185 13.206C9.69371 13.0764 9.79984 12.9125 9.86003 12.73L13.44 2.00002C13.5147 1.79897 13.5302 1.5807 13.4844 1.37114C13.4387 1.16159 13.3338 0.969571 13.1821 0.817909C13.0305 0.666247 12.8385 0.561322 12.6289 0.515606C12.4194 0.46989 12.2011 0.485305 12 0.56002L1.27004 4.14002C1.08129 4.20449 0.913177 4.3182 0.783083 4.46939C0.652989 4.62058 0.565631 4.80377 0.530035 5.00002C0.493294 5.17851 0.501473 5.36333 0.553837 5.53788C0.606202 5.71243 0.70111 5.87123 0.830035 6.00002L3.57003 8.74002L3.48004 12.21L5.82004 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.1201 0.780029L3.57007 8.74003" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_4425_8230">
        <rect width="14" height="14" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export function ChatInput({ onSendMessage, onAttachFile, onRecordAudio, isConnected = true, disabled = false, isTyping = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && isConnected && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isConnected && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessage = message.trim().length > 0;
  const isDisabled = !isConnected || disabled;

  const getPlaceholder = () => {
    if (disabled && !isTyping) return "Chat encerrado";
    if (!isConnected) return "Sem conexão - aguarde reconexão";
    if (isTyping) return "Aguardando resposta...";
    return "Escreva sua mensagem";
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={getPlaceholder()}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        slotProps={{
          input: {
            endAdornment: (
              <Box 
                sx={{ 
                  display: { xs: "none", sm: "flex" }, 
                  gap: 1, 
                  alignItems: "center",
                  alignSelf: "flex-end",
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                <IconButton
                  onClick={onRecordAudio}
                  disabled={isDisabled}
                  sx={{
                    bgcolor: "transparent",
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    color: "grey.700",
                    "&:hover": { 
                      bgcolor: "action.hover",
                    },
                    "&.Mui-disabled": {
                      color: "grey.400",
                      borderColor: "divider",
                    },
                  }}
                >
                  <MicIcon />
                </IconButton>

                <IconButton
                  onClick={onAttachFile}
                  disabled={isDisabled}
                  sx={{
                    bgcolor: "transparent",
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    color: "grey.700",
                    "&:hover": { 
                      bgcolor: "action.hover",
                    },
                    "&.Mui-disabled": {
                      color: "grey.400",
                      borderColor: "divider",
                    },
                  }}
                >
                  <AttachIcon />
                </IconButton>

                <Button
                  onClick={handleSend}
                  disabled={!hasMessage || isDisabled}
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                >
                  Enviar
                </Button>
              </Box>
            ),
          },
        }}
        sx={{
          opacity: isDisabled ? 0.7 : 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: { xs: "12px" },
            bgcolor: isDisabled ? "grey.100" : "#FFFFFF",
            padding: { xs: 0, sm: 1 },
            alignItems: "flex-end",
            "& fieldset": {
              borderColor: "divider",
            },
            "&:hover fieldset": {
              borderColor: isDisabled ? "divider" : "grey.400",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
              borderWidth: "1px",
            },
            "&.Mui-disabled": {
              bgcolor: "grey.100",
              "& fieldset": {
                borderColor: "divider",
              },
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "16px",
            fontWeight: 400,
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1, sm: 2 },
            minHeight: { xs: "20px", sm: "24px" },
            "&::placeholder": {
              color: isDisabled ? "grey.400" : "grey.500",
              opacity: 1,
            },
          },
        }}
      />

      <Box 
        sx={{ 
          display: { xs: "flex", sm: "none" }, 
          alignItems: "center",
          gap: 0.5,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <IconButton
          onClick={onRecordAudio}
          disabled={isDisabled}
          sx={{
            color: "grey.600",
            width: 40,
            height: 40,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            "&:hover": { 
              bgcolor: "action.hover",
              color: "grey.800",
            },
            "&.Mui-disabled": {
              bgcolor: "grey.100",
              color: "grey.400",
              borderColor: "divider",
            },
          }}
        >
          <MicIcon />
        </IconButton>
        <IconButton
          onClick={onAttachFile}
          disabled={isDisabled}
          sx={{
            color: "grey.600",
            width: 40,
            height: 40,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            "&:hover": { 
              bgcolor: "action.hover",
              color: "grey.800",
            },
            "&.Mui-disabled": {
              bgcolor: "grey.100",
              color: "grey.400",
              borderColor: "divider",
            },
          }}
        >
          <AttachIcon />
        </IconButton>
        <IconButton
          onClick={handleSend}
          disabled={!hasMessage || isDisabled}
          aria-label="Enviar mensagem"
          sx={{
            bgcolor: hasMessage && !isDisabled ? "primary.main" : "#FFFFFF",
            color: hasMessage && !isDisabled ? "primary.contrastText" : "grey.400",
            width: 40,
            height: 40,
            border: "1px solid",
            borderColor: hasMessage && !isDisabled ? "primary.main" : "divider",
            borderRadius: "12px",
            "&:hover": { 
              bgcolor: hasMessage && !isDisabled ? "primary.dark" : "action.hover",
            },
            "&.Mui-disabled": {
              bgcolor: isDisabled ? "grey.100" : "grey.300",
              color: "grey.400",
              borderColor: "divider",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
