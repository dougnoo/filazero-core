"use client";

import { useState, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Slide,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { EmergencyDialog } from "./EmergencyDialog";

const EMERGENCY_NUMBER = "192";
const SLIDER_THRESHOLD = 0.85;

export function SOSButton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [showSlider, setShowSlider] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const handleSOSClick = () => {
    if (isMobile) {
      setShowSlider(true);
    } else {
      setShowDialog(true);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${EMERGENCY_NUMBER}`;
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;

    const sliderWidth = sliderRef.current.offsetWidth - 60;
    const deltaX = clientX - startXRef.current;
    const progress = Math.max(0, Math.min(1, deltaX / sliderWidth));
    setSliderProgress(progress);

    if (progress >= SLIDER_THRESHOLD) {
      setIsDragging(false);
      setSliderProgress(0);
      setShowSlider(false);
      handleCall();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setSliderProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  return (
    <>
      {isMobile && (
        <Box
          onClick={handleSOSClick}
          sx={{
            position: "fixed",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 900,
            bgcolor: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 1.5,
            px: 0.5,
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
            boxShadow: "-2px 0 8px rgba(220, 38, 38, 0.3)",
            cursor: "pointer",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            SOS
          </Typography>
        </Box>
      )}

      {!isMobile && (
        <Button
          onClick={handleSOSClick}
          variant="contained"
          size="small"
          color="error"
        >
          SOS
        </Button>
      )}

      {/* Mobile: Slider overlay */}
      <Slide direction="up" in={showSlider} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: "rgba(0, 0, 0, 0.95)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            p: 3,
            pb: 4,
          }}
        >
          <IconButton
            onClick={() => setShowSlider(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 48, mb: 1 }} />
            <Typography
              sx={{
                color: "white",
                fontSize: "20px",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Emergência Médica
            </Typography>
            <Typography sx={{ color: "grey.400", fontSize: "14px" }}>
              Deslize para ligar para o SAMU (192)
            </Typography>
          </Box>

          <Box
            ref={sliderRef}
            sx={{
              position: "relative",
              height: 60,
              bgcolor: "rgba(220, 38, 38, 0.2)",
              borderRadius: "30px",
              overflow: "hidden",
              border: "2px solid #DC2626",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${sliderProgress * 100}%`,
                bgcolor: "rgba(220, 38, 38, 0.4)",
                transition: isDragging ? "none" : "width 0.3s",
              }}
            />

            <Typography
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
                opacity: 1 - sliderProgress,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Deslize para ligar →
            </Typography>

            <Box
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              sx={{
                position: "absolute",
                left: `calc(${sliderProgress * 100}% * (1 - 60px / 100%))`,
                top: 4,
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
                transition: isDragging ? "none" : "left 0.3s",
                transform: `translateX(${sliderProgress * (sliderRef.current?.offsetWidth || 300) - sliderProgress * 60}px)`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                "&:active": {
                  cursor: "grabbing",
                },
              }}
            >
              <PhoneIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
          </Box>

          <Typography
            sx={{
              color: "grey.500",
              fontSize: "12px",
              textAlign: "center",
              mt: 2,
            }}
          >
            SAMU - Serviço de Atendimento Móvel de Urgência
          </Typography>
        </Box>
      </Slide>

      {showSlider && (
        <Box
          onClick={() => setShowSlider(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1299,
          }}
        />
      )}

      {/* Desktop: Dialog */}
      <EmergencyDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
}
