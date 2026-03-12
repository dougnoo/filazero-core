import { Box, Typography, Divider, Paper, Skeleton } from "@mui/material";

export function PrescriptionSkeleton() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "20px",
           
          mb: 2,
        }}
      >
        Prescrição Médica
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper
        sx={{
          p: 3,
          bgcolor: "#F8FAFC",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Skeleton variant="text" width={150} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
            
            <Skeleton variant="text" width={200} height={20} sx={{ mb: 1 }} />
            
            {/* Notes Skeleton */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#F8F9FA",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Skeleton variant="text" width={120} height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </Box>

          <Skeleton variant="rounded" width={80} height={32} sx={{ ml: 2 }} />
        </Box>

        {/* Items Section Skeleton */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Skeleton variant="rounded" width={180} height={24} />
            <Skeleton variant="rounded" width={140} height={24} />
            <Skeleton variant="rounded" width={160} height={24} />
          </Box>
        </Box>

        {/* Footer Skeleton */}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #E2E8F0" }}>
          <Skeleton variant="text" width={250} height={16} />
        </Box>
      </Paper>
    </Box>
  );
}