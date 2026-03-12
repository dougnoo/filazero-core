"use client";

import { Button, ButtonProps, Box } from "@mui/material";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";

interface ImportButtonProps extends Omit<ButtonProps, "variant" | "color" | "startIcon"> {
  label: string;
}

const ImportIcon = () => (
  <Box
    component="img"
    src={buildAssetUrl("theme/admin/icons/import-icon.png")}
    alt=""
    sx={{
      width: 20,
      height: 20,
      filter: "brightness(0) invert(1)",
    }}
  />
);

export function ImportButton({ label, onClick, disabled, sx, ...props }: ImportButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<ImportIcon />}
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
