"use client";

import { Box, CircularProgress, Divider, IconButton, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect, useCallback } from "react";
import { networkProvidersService } from "../services/networkProvidersService";
import type { NearbyProvider } from "../types/networkProviders.types";
import { ProviderCardNew } from "./ProviderCardNew";

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.31427 15.7142L11.4286 18.8142C11.6196 19.0101 11.8585 19.1526 12.1216 19.2278C12.3847 19.3029 12.6629 19.3081 12.9286 19.2428C13.1959 19.1806 13.4428 19.0507 13.6454 18.8656C13.8481 18.6805 13.9997 18.4463 14.0857 18.1856L19.2 2.85707C19.3067 2.56986 19.3287 2.25804 19.2634 1.95867C19.1981 1.65931 19.0482 1.385 18.8316 1.16834C18.6149 0.951677 18.3406 0.801784 18.0412 0.736475C17.7419 0.671166 17.43 0.693188 17.1428 0.799924L1.81427 5.91421C1.54462 6.00631 1.30447 6.16875 1.11862 6.38473C0.932772 6.60072 0.807974 6.86242 0.757123 7.14278C0.704636 7.39777 0.716321 7.6618 0.791127 7.91115C0.865932 8.1605 1.00152 8.38737 1.18569 8.57135L5.09998 12.4856L4.97141 17.4428L8.31427 15.7142Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.743 1.11426L5.1001 12.4857" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type ChatMsgType = "text" | "providers";

interface ChatMsg {
  sender: "assistant" | "user";
  type: ChatMsgType;
  text?: string;
  providers?: NearbyProvider[];
  ts: number;
}

interface NetworkAssistantProps {
  onPickSpecialty?: (specialtyName: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  showProviderCards?: boolean;
}

// Coordenadas default de São Paulo (usado quando localização não está disponível)
const DEFAULT_LATITUDE = -23.5505;
const DEFAULT_LONGITUDE = -46.6333;

export function NetworkAssistant({ onPickSpecialty, userLocation, showProviderCards = true }: NetworkAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      sender: "assistant",
      type: "text",
      text: "Olá! Sou seu assistente para encontrar clínicas e especialidades. Como posso ajudar hoje?",
      ts: Date.now(),
    },
    {
      sender: "assistant",
      type: "text",
      text: "Me conte um pouco sobre qual é o principal sintoma ou problema que você está sentindo agora",
      ts: Date.now(),
    },
  ]);

  const latitude = userLocation?.lat ?? DEFAULT_LATITUDE;
  const longitude = userLocation?.lng ?? DEFAULT_LONGITUDE;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const appendText = useCallback((sender: ChatMsg["sender"], text: string) => {
    setMsgs((prev) => [...prev, { sender, type: "text", text, ts: Date.now() }]);
  }, []);

  const appendProviders = useCallback((providers: NearbyProvider[]) => {
    setMsgs((prev) => [...prev, { sender: "assistant", type: "providers", providers, ts: Date.now() }]);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    
    setInput("");
    appendText("user", text);
    setIsLoading(true);

    try {
      const response = await networkProvidersService.searchByChat({
        message: text,
        latitude,
        longitude,
      });

      if (response.message) {
        appendText("assistant", response.message);
      }

      if (response.data && response.data.length > 0) {
        if (showProviderCards) {
          appendProviders(response.data);
        }
        if (response.extractedSpecialty && onPickSpecialty) {
          onPickSpecialty(response.extractedSpecialty);
        }
      } else if (!response.message) {
        appendText("assistant", "Não encontrei prestadores para sua busca. Tente descrever de outra forma ou buscar por outra especialidade.");
      }
    } catch (error) {
      console.error("Erro ao buscar via chat:", error);
      appendText("assistant", "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRadius: "14px",
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
          Assistente conversacional
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {msgs.map((m, idx) => {
          if (m.type === "providers" && m.providers) {
            return (
              <Box key={`${m.ts}-${idx}`} sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                {m.providers.map((provider) => (
                  <ProviderCardNew key={provider.id} provider={provider} />
                ))}
              </Box>
            );
          }

          return (
            <Box
              key={`${m.ts}-${idx}`}
              sx={{
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                bgcolor: m.sender === "user" ? "primary.main" : "#F3F4F6",
                color: m.sender === "user" ? "primary.contrastText" : "text.primary",
                px: 1.5,
                py: 1.25,
                borderRadius: "14px",
                fontSize: 12.5,
                lineHeight: 1.35,
                border: m.sender === "user" ? "none" : 1,
                borderColor: m.sender === "user" ? "transparent" : "divider",
                whiteSpace: "pre-wrap",
                maxWidth: "85%",
              }}
            >
              {m.text}
            </Box>
          );
        })}
        
        {isLoading && (
          <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.25 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Buscando...</Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            bgcolor: "grey.50",
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            p: 1,
          }}
        >
          <TextField
            inputRef={textareaRef}
            multiline
            maxRows={4}
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                p: 0,
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-input": {
                fontSize: 16,
                lineHeight: 1.4,
                p: 0.5,
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
              borderRadius: "10px",
              flexShrink: 0,
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "grey.300" },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
