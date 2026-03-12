import { Box, Stack, Typography, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function HistoryListSkeleton({ count = 3 }: { count?: number }) {
  const theme = useTheme();

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontSize: '14px',
          fontWeight: 600,
           
        }}
      >
        Histórico de triagem
      </Typography>
      
      <Stack spacing={1.5}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: 'background.default',
              borderRadius: '8px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="rectangular" width={70} height={18} sx={{ borderRadius: '4px' }} />
              </Box>
              <Skeleton variant="text" width="30%" height={16} />
            </Stack>
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
