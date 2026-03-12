"use client";

import { Chip, Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface StatusChipProps {
  status: string;
  label: string;
  colorMap: Record<string, { color: string; bgColor: string }>;
  showArrow?: boolean;
}

export function StatusChip({ status, label, colorMap, showArrow = true }: StatusChipProps) {
  const statusColors = colorMap[status] || { color: "#6B7280", bgColor: "#F3F4F6" };

  return (
    <Chip
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {label}
          {showArrow && <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: -0.25 }} />}
        </Box>
      }
      size="small"
      sx={{
        bgcolor: statusColors.bgColor,
        color: statusColors.color,
        fontWeight: 500,
        fontSize: "12px",
        height: 28,
        "& .MuiChip-label": {
          px: 1,
        },
      }}
    />
  );
}