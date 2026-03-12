import { Box, Skeleton } from "@mui/material";

export function SidebarSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Dados Pessoais Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Divider */}
      <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 3 }} />

      {/* Histórico Médico Skeleton */}
      <Box>
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
        
        {/* Sections */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <Box key={sectionIndex}>
              <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <Skeleton key={itemIndex} variant="text" width="80%" height={16} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}