"use client";

import { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { TextEditorToolbar } from "./TextEditorToolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
}: RichTextEditorProps) {
  const theme = useThemeColors();
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Sincronizar o conteúdo HTML quando o value mudar externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const checkActiveFormats = () => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
    
    setActiveFormats(formats);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const handleSelectionChange = () => {
    // Verificar se a seleção está dentro do editor
    const selection = window.getSelection();
    if (selection && editorRef.current?.contains(selection.anchorNode)) {
      checkActiveFormats();
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const minHeight = rows * 24 + 32;

  return (
    <Box>
      {label && (
        <Box
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: theme.textDark,
            mb: 1,
          }}
        >
          {label}
        </Box>
      )}
      <Box
        sx={{
          border: `1px solid ${theme.softBorder}`,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <TextEditorToolbar 
          onFormat={applyFormat} 
          activeFormats={activeFormats}
        />
        
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onMouseUp={checkActiveFormats}
          onKeyUp={checkActiveFormats}
          data-placeholder={placeholder}
          sx={{
            p: 2,
            minHeight: `${minHeight}px`,
            maxHeight: "400px",
            overflowY: "auto",
            bgcolor: theme.backgroundSoft,
            fontSize: "14px",
            fontFamily: theme.fontFamily,
            lineHeight: 1.6,
            outline: "none",
            cursor: "text",
            "&:empty:before": {
              content: "attr(data-placeholder)",
              color: theme.textMuted,
              fontStyle: "italic",
            },
            "& strong, & b": {
              fontWeight: 700,
            },
            "& em, & i": {
              fontStyle: "italic",
            },
            "& u": {
              textDecoration: "underline",
            },
            "& ul, & ol": {
              pl: 3,
              my: 1,
            },
            "& li": {
              my: 0.5,
            },
            "& a": {
              color: theme.primary,
              textDecoration: "underline",
              "&:hover": {
                opacity: 0.8,
              },
            },
            "& p": {
              my: 0.5,
            },
          }}
        />
      </Box>
    </Box>
  );
}
