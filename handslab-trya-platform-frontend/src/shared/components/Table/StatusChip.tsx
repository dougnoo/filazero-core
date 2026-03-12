"use client";

import { Chip } from "@mui/material";

interface StatusChipProps {
  status: string;
  label: string;
  colorMap: Record<string, { color: string; bgColor: string }>;
}

export function StatusChip({ status, label, colorMap }: StatusChipProps) {
  const statusColors = colorMap[status] || { color: "#6B7280", bgColor: "#F3F4F6" };

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: statusColors.bgColor,
        color: statusColors.color,
        fontWeight: 500,
        fontSize: "12px",
        height: 24,
      }}
    />
  );
}