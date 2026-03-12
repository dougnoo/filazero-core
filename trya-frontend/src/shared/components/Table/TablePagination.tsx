"use client";

import { Box, IconButton, Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50],
}: TablePaginationProps) {
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onItemsPerPageChange?.(Number(event.target.value));
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationButtonStyles = (disabled: boolean) => ({
    width: 32,
    height: 32,
    bgcolor: disabled ? "#E5E7EB" : "primary.main",
    color: disabled ? "#9CA3AF" : "primary.contrastText",
    "&:hover": {
      bgcolor: disabled ? "#E5E7EB" : "primary.dark",
    },
    "&.Mui-disabled": {
      bgcolor: "#E5E7EB",
      color: "#9CA3AF",
    },
  });

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
      {/* Setas de navegação */}
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
          disabled={isFirstPage}
          sx={paginationButtonStyles(isFirstPage)}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={isLastPage}
          sx={paginationButtonStyles(isLastPage)}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Itens por página e contador */}
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
        {onItemsPerPageChange && (
          <>
            <Typography
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontSize: "14px",
                color: "#6B7280",
                whiteSpace: "nowrap",
              }}
            >
              Itens por página:
            </Typography>
            <Select
              value={itemsPerPage}
              onChange={handlePageSizeChange}
              size="small"
              sx={{ minWidth: 70 }}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </>
        )}

        <Typography
          sx={{
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontSize: "14px",
            color: "#6B7280",
            whiteSpace: "nowrap",
          }}
        >
          {`${startItem}-${endItem} de ${totalItems}`}
        </Typography>
      </Box>
    </Box>
  );
}
