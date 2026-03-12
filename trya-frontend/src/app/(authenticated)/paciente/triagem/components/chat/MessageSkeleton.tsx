import { Box, Skeleton } from "@mui/material";

interface MessageSkeletonProps {
  count?: number;
}

export function MessageSkeleton({ count = 3 }: MessageSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            flexDirection: index % 2 === 0 ? "row" : "row-reverse",
          }}
        >
          {/* Avatar skeleton */}
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ flexShrink: 0 }}
          />

          {/* Message content skeleton */}
          <Box
            sx={{
              flex: 1,
              maxWidth: "70%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: "12px" }}
            />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Box>
      ))}
    </>
  );
}
