"use client";

import { Box, Typography, Select, MenuItem, IconButton } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: TablePaginationProps) {
  const theme = useThemeColors();

  const isPreviousDisabled = currentPage === 1 || totalPages === 0;
  const isNextDisabled = currentPage >= totalPages || totalPages === 0;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", md: "space-between" },
        alignItems: "center",
        px: 3,
        py: 2,
        borderTop: "1px solid #E5E7EB",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        position: "relative",
      }}
    >
      {/* Navigation arrows */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          order: { xs: 2, md: 0 },
          position: { xs: "relative", md: "absolute" },
          left: { xs: "auto", md: "50%" },
          transform: { xs: "none", md: "translateX(-50%)" },
        }}
      >
        <IconButton
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={isPreviousDisabled}
          sx={{
            width: 32,
            height: 32,
            bgcolor: isPreviousDisabled ? "#E5E7EB" : theme.primary,
            color: isPreviousDisabled ? "#9CA3AF" : "#FFFFFF",
            "&:hover": {
              bgcolor: isPreviousDisabled ? "#E5E7EB" : theme.primary,
              opacity: isPreviousDisabled ? 1 : 0.9,
            },
            "&.Mui-disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.5 1L1.5 6L6.5 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={isNextDisabled}
          sx={{
            width: 32,
            height: 32,
            bgcolor: isNextDisabled ? "#E5E7EB" : theme.primary,
            color: isNextDisabled ? "#9CA3AF" : "#FFFFFF",
            "&:hover": {
              bgcolor: isNextDisabled ? "#E5E7EB" : theme.primary,
              opacity: isNextDisabled ? 1 : 0.9,
            },
            "&.Mui-disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5 1L6.5 6L1.5 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </Box>

      {/* Items per page and counter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          order: { xs: 1, md: 0 },
          marginLeft: { xs: 0, md: "auto" },
          flexWrap: { xs: "wrap", sm: "nowrap" },
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            color: "#6B7280",
            whiteSpace: "nowrap",
          }}
        >
          Itens por página:
        </Typography>
        <Select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 70 }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

        <Typography
          sx={{
            fontSize: "14px",
            color: "#6B7280",
            whiteSpace: "nowrap",
          }}
        >
          {totalItems > 0
            ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                currentPage * itemsPerPage,
                totalItems,
              )} de ${totalItems}`
            : "0 de 0"}
        </Typography>
      </Box>
    </Box>
  );
}