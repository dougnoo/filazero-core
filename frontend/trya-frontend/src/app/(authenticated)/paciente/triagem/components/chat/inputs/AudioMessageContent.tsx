"use client";

import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";

interface AudioMessageContentProps {
  timestamp: string;
  audioUrl?: string;
  transcription?: string;
  isTranscribing?: boolean;
}

export function AudioMessageContent({
  timestamp,
  audioUrl,
  transcription,
  isTranscribing = false,
}: AudioMessageContentProps) {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      if (audioElement.duration) setCurrentTime(audioElement.duration);
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

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        borderRadius: "16px",
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "350px",
        minWidth: { xs: "260px", sm: "320px" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 2 }}>
        <IconButton
          onClick={togglePlay}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            width: 44,
            height: 44,
            flexShrink: 0,
            boxShadow: isPlaying ? `0 0 12px ${theme.palette.primary.main}` : "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": { bgcolor: "primary.main", opacity: 0.9, transform: "scale(1.05)" },
            transition: "transform 0.2s, opacity 0.2s, box-shadow 0.2s",
            "&.Mui-disabled": { opacity: 0.4 },
          }}
          disabled={!audioUrl}
        >
          {isPlaying ? <Pause sx={{ fontSize: 24 }} /> : <PlayArrow sx={{ fontSize: 24 }} />}
        </IconButton>

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
              backgroundImage: `url("${buildAssetUrl('theme/ui/audio-frame.png')}")`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              cursor: audioUrl ? "pointer" : "default",
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
                  backgroundColor: "primary.main",
                  left: `calc(${clampedProgress * 100}% - 1px)`,
                  transition: "left 0.1s linear",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>

          <Typography sx={{ fontSize: "12px", color: "grey.800", fontWeight: 500 }}>
            {formatTime(currentTime)}
          </Typography>

          {isTranscribing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={12} thickness={6} />
              <Typography sx={{ fontSize: "12px", color: "grey.600" }}>Transcrevendo...</Typography>
            </Box>
          )}

          {transcription && (
            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Typography sx={{ fontSize: "13px", lineHeight: 1.6 }}>{transcription}</Typography>
            </Box>
          )}

          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 400,
              color: "grey.800",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "flex-end",
            }}
          >
            {timestamp} ✓✓
          </Typography>
        </Box>
      </Box>

      <audio ref={audioRef} src={audioUrl} preload="metadata" hidden />
    </Box>
  );
}
