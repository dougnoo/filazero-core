"use client";

import { Button, Typography } from "@mui/material";
interface TopicButtonProps {
  question: string;
  onClick: () => void;
}

export function TopicButton({ question, onClick }: TopicButtonProps) {

  return (
    <Button
      onClick={onClick}
      fullWidth
      variant="contained"
      color="secondary"
      sx={{
        textTransform: "none",
        borderRadius: "8px",
        py: 2,
        px: 3,
        justifyContent: "flex-start",
        textAlign: "left",
        fontSize: "14px",         
        fontWeight: 400,
        border: "none",
      }}
    >
      <Typography
        sx={{
          fontSize: "14px",
           
          fontWeight: 400,
          lineHeight: "20px",
          textAlign: "left",
        }}
      >
        {question}
      </Typography>
    </Button>
  );
}

