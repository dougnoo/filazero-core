"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { Mic, Close } from "@mui/icons-material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useGlobalThemeContext } from "@/shared/context/GlobalThemeContext";
import type { AudioRecording } from "@/shared/types/chat";

interface AudioPreviewProps {
  isRecording: boolean;
  recordingTime: number;
  audioRecording: AudioRecording | null;
  onStop: () => void;
  onSend: () => void;
  onDelete: () => void;
}

export function AudioPreview({
  isRecording,
  recordingTime,
  audioRecording,
  onStop,
  onSend,
  onDelete,
}: AudioPreviewProps) {
  const theme = useThemeColors();
  const { theme: themeObject } = useGlobalThemeContext();
  const isDefaultTheme = themeObject?.id === 'default';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioRecording?.duration ?? 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const secsFixed = secs.toFixed(2).padStart(5, "0"); // 00.00
    return `${mins}:${secsFixed}`;
  };

  useEffect(() => {
    setDuration(audioRecording?.duration ?? 0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioRecording?.url, audioRecording?.duration]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const metaDuration = e.currentTarget.duration;
    const fallback = audioRecording?.duration ?? 0;
    if (!Number.isNaN(metaDuration) && Number.isFinite(metaDuration) && metaDuration > 0) {
      setDuration(metaDuration);
    } else if (fallback > 0) {
      setDuration(fallback);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const effectiveDuration = audioRef.current?.duration && Number.isFinite(audioRef.current.duration)
    ? audioRef.current.duration
    : duration;

  const handleSendAndClose = () => {
    onSend();
    onDelete();
  };

  // Renderiza apenas quando há gravação ou pré-visualização
  if (!isRecording && !audioRecording) return null;

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: `1px solid ${theme.softBorder}`,
        borderRadius: "12px",
        bgcolor: "#F5F5F5",
      }}
    >
      {isRecording ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#F44336",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
            <Mic sx={{ fontSize: 20, color: "#F44336" }} />
            <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
              Gravando... {formatTime(recordingTime)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={onStop}
            sx={{
              bgcolor: "#F44336",
              color: theme.white,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 500,
              py: 1,
              px: 2,
              "&:hover": { bgcolor: "#D32F2F" },
            }}
          >
            Parar
          </Button>
        </Box>
      ) : audioRecording ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <audio
              key={audioRecording.url}
              ref={audioRef}
              src={audioRecording.url}
              controls
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                if (audioRef.current?.duration) {
                  setCurrentTime(audioRef.current.duration);
                }
              }}
              style={{
                width: "100%",
                maxWidth: "300px",
                height: "40px",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <IconButton
              onClick={onDelete}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#FFEBEE",
                color: "#D32F2F",
                border: "1px solid #FDD7DF",
                "&:hover": {
                  bgcolor: "#F44336",
                  color: "#FFFFFF",
                },
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleSendAndClose}
              sx={{
                bgcolor: isDefaultTheme ? theme.secondary : theme.primary,
                color: theme.secondary,
                fontSize: "13px",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 500,
                py: 1,
                px: 2,
                "&:hover": { 
                  bgcolor: isDefaultTheme ? theme.secondary : theme.primary,
                  opacity: 0.9,
                },
              }}
            >
              Enviar áudio
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

