"use client";

import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useEffect, useRef, useState } from "react";

interface AudioMessageProps {
  duration: string;
  timestamp: string;
  sender: "bot" | "user";
  audioUrl?: string;
  messageId: string;
  transcription?: string;
  userName?: string;
  onTranscribe?: (messageId: string) => Promise<string | void>;
}

export function AudioMessage({
  duration: durationProp, // eslint-disable-line @typescript-eslint/no-unused-vars
  timestamp,
  sender,
  audioUrl,
  messageId,
  transcription,
  userName,
  onTranscribe,
}: AudioMessageProps) {
  const theme = useThemeColors();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [localTranscription, setLocalTranscription] = useState(transcription);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const isBot = sender === "bot";
  const isUser = sender === "user";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Gera iniciais do nome do usuário
  const getUserInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    setLocalTranscription(transcription);
  }, [transcription]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audioElement.duration) {
        setCurrentTime(audioElement.currentTime);
        setProgress(audioElement.currentTime / audioElement.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(1);
      if (audioElement.duration) {
        setCurrentTime(audioElement.duration);
      }
    };

    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  const togglePlay = async () => {
    if (!audioUrl || !audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch {
      // Silently handle play errors
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioUrl || !audioRef.current || !audioRef.current.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioRef.current.duration;

    audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
    setCurrentTime(audioRef.current.currentTime);
    setProgress(audioRef.current.currentTime / audioRef.current.duration);
  };

  const handleTranscribe = async () => {
    if (!onTranscribe || isTranscribing) return;
    setTranscriptionError(null);
    setIsTranscribing(true);
    try {
      const result = await onTranscribe(messageId);
      if (typeof result === "string") {
        setLocalTranscription(result);
      }
    } catch (error: unknown) {
      const err = error as Error;
      setTranscriptionError(
        err?.message || "Não foi possível transcrever o áudio agora."
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  // Formata segundos para mm:ss
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };


  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: isBot ? "#FFFFFF" : theme.avatarBackground,
          color: isBot ? theme.textDark : theme.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: 600,
          flexShrink: 0,
          fontFamily: theme.fontFamily,
        }}
      >
        {isBot ? "🤖" : getUserInitials()}
      </Box>

      {/* Message Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            bgcolor: isBot ? "#F5F5F5" : theme.backgroundSoft,
            borderRadius: "16px",
            p: 2,
            border: "1px solid",
            borderColor: isBot ? theme.softBorder : theme.softBorder,
            maxWidth: "350px",
            minWidth: { xs: "260px", sm: "320px" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "stretch", gap: 2 }}>
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <IconButton
                onClick={togglePlay}
                sx={{
                  bgcolor: theme.primary,
                  color: theme.white,
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  boxShadow: isPlaying 
                    ? `0 0 12px ${theme.primary}` 
                    : "0 2px 8px rgba(0,0,0,0.15)",
                  "&:hover": { 
                    bgcolor: theme.primary, 
                    opacity: 0.9,
                    transform: "scale(1.05)",
                  },
                  transition: "transform 0.2s, opacity 0.2s, box-shadow 0.2s",
                  ...(isPlaying && {
                    animation: "pulseButton 1.5s ease-in-out infinite",
                    "@keyframes pulseButton": {
                      "0%, 100%": {
                        boxShadow: `0 0 12px ${theme.primary}`,
                      },
                      "50%": {
                        boxShadow: `0 0 20px ${theme.primary}`,
                      },
                    },
                  }),
                  "&.Mui-disabled": {
                    opacity: 0.4,
                  },
                }}
                disabled={!audioUrl}
              >
                {isPlaying ? <Pause sx={{ fontSize: 24 }} /> : <PlayArrow sx={{ fontSize: 24 }} />}
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                onClick={handleWaveformClick}
                sx={{
                  height: 32,
                  borderRadius: "999px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  px: 1.5,
                  gap: 0.75,
                  backgroundImage: 'url("/Frame.png")',
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  cursor: audioUrl ? "pointer" : "default",
                  transition: "opacity 0.2s, transform 0.2s",
                  "&:hover": audioUrl ? {
                    opacity: 0.9,
                    transform: "scale(1.01)",
                  } : {},
                  ...(isPlaying && {
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        opacity: 1,
                      },
                      "50%": {
                        opacity: 0.85,
                      },
                    },
                  }),
                }}
              >
                {audioUrl && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      width: 2,
                      borderRadius: "999px",
                      backgroundColor: theme.primary,
                      left: `calc(${clampedProgress * 100}% - 1px)`,
                      transition: "left 0.1s linear",
                      pointerEvents: "none",
                      boxShadow: isPlaying ? `0 0 8px ${theme.primary}` : "none",
                    }}
                  />
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "12px",
                  fontFamily: theme.fontFamily,
                  color: theme.textMuted,
                  fontWeight: 500,
                }}
              >
                {formatTime(currentTime)}
              </Typography>

              {audioUrl && !localTranscription && (
                <Box
                  component="button"
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  sx={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "12px",
                    fontFamily: theme.fontFamily,
                    color: theme.primary,
                    textDecoration: "underline",
                    cursor: isTranscribing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    alignSelf: "flex-start",
                    "&:hover": {
                      opacity: 0.8,
                    },
                    "&:disabled": {
                      opacity: 0.6,
                    },
                  }}
                >
                  {isTranscribing && <CircularProgress size={12} thickness={6} />}
                  {isTranscribing ? "Transcrevendo..." : "Transcrever"}
                </Box>
              )}

              {transcriptionError && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#D32F2F",
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {transcriptionError}
                  </Typography>
                </Box>
              )}

              {localTranscription && (
                <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${theme.softBorder}` }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: theme.textDark,
                      lineHeight: 1.6,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {localTranscription}
                  </Typography>
                </Box>
              )}

              {/* Timestamp - dentro da caixa, alinhado à direita */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontFamily: theme.fontFamily,
                    fontWeight: 400,
                    color: theme.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {timestamp} ✓✓
                </Typography>
              </Box>
            </Box>
          </Box>

          <audio 
            ref={audioRef} 
            src={audioUrl} 
            preload="metadata"
            hidden 
          />
        </Box>
      </Box>
    </Box>
  );
}

