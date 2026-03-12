"use client";

import { IconButton, Box } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
} from "@mui/icons-material";

interface TextEditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  activeFormats?: Set<string>;
}

export function TextEditorToolbar({ onFormat, activeFormats = new Set() }: TextEditorToolbarProps) {
  const theme = useThemeColors();

  const handleLinkInsert = () => {
    const url = prompt("Digite a URL:");
    if (url) {
      onFormat("createLink", url);
    }
  };

  const toolbarButtons = [
    { 
      icon: <FormatBold sx={{ fontSize: 18 }} />, 
      command: "bold",
      action: () => onFormat("bold"), 
      title: "Negrito (Ctrl+B)" 
    },
    { 
      icon: <FormatItalic sx={{ fontSize: 18 }} />, 
      command: "italic",
      action: () => onFormat("italic"), 
      title: "Itálico (Ctrl+I)" 
    },
    { 
      icon: <FormatUnderlined sx={{ fontSize: 18 }} />, 
      command: "underline",
      action: () => onFormat("underline"), 
      title: "Sublinhado (Ctrl+U)" 
    },
    { 
      icon: <FormatListBulleted sx={{ fontSize: 18 }} />, 
      command: "insertUnorderedList",
      action: () => onFormat("insertUnorderedList"), 
      title: "Lista com marcadores" 
    },
    { 
      icon: <FormatListNumbered sx={{ fontSize: 18 }} />, 
      command: "insertOrderedList",
      action: () => onFormat("insertOrderedList"), 
      title: "Lista numerada" 
    },
    { 
      icon: <LinkIcon sx={{ fontSize: 18 }} />, 
      command: "createLink",
      action: handleLinkInsert, 
      title: "Inserir link" 
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        p: 1,
        borderRadius: "8px 8px 0 0",
        borderBottom: `1px solid ${theme.softBorder}`,
        bgcolor: theme.backgroundSoft,
      }}
    >
      {toolbarButtons.map((button, index) => {
        const isActive = activeFormats.has(button.command);
        
        return (
          <IconButton
            key={index}
            onClick={button.action}
            title={button.title}
            size="small"
            sx={{
              color: isActive ? theme.primary : theme.textMuted,
              bgcolor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
              width: 32,
              height: 32,
              border: isActive ? `1px solid ${theme.primary}` : "1px solid transparent",
              "&:hover": {
                bgcolor: isActive ? "rgba(59, 130, 246, 0.15)" : "rgba(0, 0, 0, 0.04)",
                color: isActive ? theme.primary : theme.textDark,
              },
            }}
          >
            {button.icon}
          </IconButton>
        );
      })}
    </Box>
  );
}

