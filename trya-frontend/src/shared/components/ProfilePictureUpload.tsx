"use client";

import { useState, useRef } from "react";
import {
  Box,
  Avatar,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useToast } from "@/shared/hooks/useToast";
import { profilePictureService } from "@/shared/services/profilePictureService";

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName: string;
  onUploadSuccess: (imageUrl: string) => void;
  size?: number;
  /** Quando true, sempre renderiza o botão "Remover foto" (desabilitado se não houver imagem) */
  alwaysShowRemove?: boolean;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  userName,
  onUploadSuccess,
  size = 100,
  alwaysShowRemove = false,
}: ProfilePictureUploadProps) {
  const { showError, showSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await profilePictureService.uploadProfilePicture(file);
      onUploadSuccess(imageUrl);
      showSuccess("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      showError(
        error instanceof Error ? error.message : "Erro ao fazer upload da foto"
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      await profilePictureService.deleteProfilePicture();
      onUploadSuccess(""); // Pass empty string to clear the image
      showSuccess("Foto de perfil removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      showError(
        error instanceof Error ? error.message : "Erro ao remover foto"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={currentImageUrl}
          sx={{
            width: size,
            height: size,
            bgcolor: "primary.light",
            color: "primary.main",
            fontSize: `${size * 0.32}px`,
            fontWeight: 600,
          }}
        >
          {!currentImageUrl && userName ? getInitials(userName) : "?"}
        </Avatar>

        {isUploading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
            }}
          >
            <CircularProgress size={24} sx={{ color: "white" }} />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? "Enviando..." : "Atualizar foto"}
        </Button>

        {(currentImageUrl || alwaysShowRemove) && (
          <Button
            variant="text"
            onClick={handleRemovePhoto}
            disabled={isUploading || !currentImageUrl}
          >
            Remover foto
          </Button>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* File size and format info */}
      <Box sx={{ ml: 2 }}>
        <Typography
          sx={{
            fontSize: "12px",
            color: "grey.800",
            lineHeight: 1.4,
          }}
        >
          Formatos aceitos: JPG, PNG
          <br />
          Tamanho máximo: 5MB
        </Typography>
      </Box>
    </Box>
  );
}
