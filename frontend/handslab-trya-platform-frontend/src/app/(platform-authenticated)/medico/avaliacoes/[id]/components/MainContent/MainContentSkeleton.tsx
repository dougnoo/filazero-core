import { Box, Skeleton } from "@mui/material";

export function MainContentSkeleton() {
  return (
        <>
        {/* Content Sections */}
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </Box>
        ))}

        {/* Anexos */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="30%" height={16} />
                </Box>
                <Skeleton variant="rounded" width={80} height={32} />
              </Box>
            ))}
          </Box>
        </Box>

      {/* Botões de Ação */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          pt: 2,
        }}
      >
        <Skeleton variant="rounded" width={150} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </Box>
    </>
  );
}