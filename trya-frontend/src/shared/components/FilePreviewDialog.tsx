"use client";

import { Dialog, DialogContent, IconButton, Box, CircularProgress, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useState, useCallback } from "react";

interface FilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
}

const isImageFile = (url: string | null | undefined, fileName?: string | null): boolean => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  const lowerUrl = url.toLowerCase();
  const lowerName = fileName?.toLowerCase() || "";
  return imageExtensions.some((ext) => lowerUrl.includes(ext) || lowerName.endsWith(ext));
};

export function FilePreviewDialog({ open, onClose, fileUrl, fileName }: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);

  const isImage = isImageFile(fileUrl, fileName);
  const hasFile = Boolean(fileUrl);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleClose = () => {
    setLoading(true);
    setError(false);
    setZoom(1);
    onClose();
  };

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
          m: { xs: 1, md: 2 },
          borderRadius: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: 14, color: "text.secondary" }}>
          {fileName || "Visualização do arquivo"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {isImage && !error && (
            <>
              <IconButton onClick={handleZoomOut} size="small" title="Diminuir zoom">
                <ZoomOutIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: 12, color: "text.secondary", minWidth: 40, textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton onClick={handleZoomIn} size="small" title="Aumentar zoom">
                <ZoomInIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={handleResetZoom} size="small" title="Resetar zoom">
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, position: "relative", overflow: "hidden" }}>
        {!hasFile ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              gap: 2,
            }}
          >
            <Typography color="text.secondary">Este documento não possui arquivo anexado</Typography>
          </Box>
        ) : (
          <>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.paper",
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.paper",
                  gap: 2,
                }}
              >
                <Typography color="error">Não foi possível carregar o arquivo</Typography>
                <Typography
                  sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  onClick={() => window.open(fileUrl, "_blank")}
                >
                  Abrir em nova aba
                </Typography>
              </Box>
            )}

            {isImage ? (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  overflow: "auto",
                  display: "flex",
                  alignItems: zoom <= 1 ? "center" : "flex-start",
                  justifyContent: zoom <= 1 ? "center" : "flex-start",
                  bgcolor: "#f5f5f5",
                }}
              >
                <Box
                  component="img"
                  src={fileUrl}
                  alt={fileName || "Preview"}
                  onLoad={handleLoad}
                  onError={handleError}
                  sx={{
                    maxWidth: zoom <= 1 ? "100%" : "none",
                    maxHeight: zoom <= 1 ? "100%" : "none",
                    width: zoom > 1 ? `${zoom * 100}%` : "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: error ? "none" : "block",
                    transition: "width 0.2s ease",
                  }}
                />
              </Box>
            ) : (
              <iframe
                src={fileUrl}
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: error ? "none" : "block",
                }}
                title={fileName || "Visualização do arquivo"}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
