"use client";

import { Box } from "@mui/material";
import { FaqConversation } from "@/shared/components/faq/FaqConversation";

export default function AdminFaqPage() {
  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        px: { xs: 2, sm: 3 },
        pb: { xs: 3, md: 4 },
      }}
    >
      <FaqConversation />
    </Box>
  );
}


