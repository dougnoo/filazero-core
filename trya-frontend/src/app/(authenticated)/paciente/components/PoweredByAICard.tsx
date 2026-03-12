"use client";

import { Paper, Typography } from "@mui/material";

export function PoweredByAICard() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "12px",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: { xs: "14px", sm: "15px" },
          color: "text.primary",
        }}
      >
        Powered by AI
      </Typography>
    </Paper>
  );
}
