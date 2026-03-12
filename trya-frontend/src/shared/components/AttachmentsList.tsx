"use client";

import { Box, Typography, Button } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import type { AttachmentDetails } from "@/app/(platform-authenticated)/medico/types";

interface AttachmentsListProps {
  attachments: AttachmentDetails[];
  title?: string;
  onDownload?: (attachment: AttachmentDetails) => void;
  onView?: (attachment: AttachmentDetails) => void;
}

export function AttachmentsList({
  attachments,
  title = "Anexos",
  onDownload,
  onView,
}: AttachmentsListProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "18px",
           
        }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {attachments.map((attachment) => (
          <Box
            key={attachment.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: "8px",
              border: 1,
              borderColor: "divider",
              cursor: onView ? "pointer" : "default",
              "&:hover": onView
                ? {
                    bgcolor: "action.hover",
                  }
                : {},
            }}
            onClick={() => onView && onView(attachment)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DescriptionIcon sx={{ color: "grey.800" }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                     
                  }}
                >
                  {attachment.originalName}
                </Typography>
                {onView && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "grey.800",
                    }}
                  >
                    Visualizar
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {onDownload && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(attachment);
                  }}
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                     
                  }}
                >
                  Baixar
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}
