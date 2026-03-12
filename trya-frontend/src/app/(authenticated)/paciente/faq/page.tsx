"use client";

import { Box } from "@mui/material";
import { FAQSidebar } from "./components/FAQSidebar";
import { FaqConversation } from "@/shared/components/faq/FaqConversation";

export default function FAQPage() {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Sidebar */}
      <FAQSidebar />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
        }}
      >
        <FaqConversation />
      </Box>
    </Box>
  );
}
