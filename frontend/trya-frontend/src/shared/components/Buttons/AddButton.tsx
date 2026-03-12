"use client";

import { Button, ButtonProps } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AddButtonProps extends Omit<ButtonProps, "variant" | "color" | "startIcon"> {
  label: string;
}

export function AddButton({ label, onClick, disabled, sx, ...props }: AddButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon sx={{ fontSize: 20 }} />}
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: 56,
        whiteSpace: "nowrap",
        textTransform: "none",
        fontWeight: 600,
        fontSize: "14px",
        borderRadius: "8px",
        px: 3,
        flexShrink: 0,
        ...sx,
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
