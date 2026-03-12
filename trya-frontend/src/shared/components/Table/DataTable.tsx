"use client";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { TablePagination } from "@/shared/components/Pagination/TablePagination";

export interface TableColumn<T = any> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  icon: React.ReactNode;
  onClick: (row: T, event: React.MouseEvent) => void;
  tooltip?: string;
}

interface DataTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  onRowClick?: (row: T) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  headerBackgroundColor?: string;
  hidePagination?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions = [],
  onRowClick,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "Nenhum item encontrado",
  headerBackgroundColor = "#F8F9FA",
  hidePagination = false,
}: DataTableProps<T>) {
  const getCellValue = (row: T, column: TableColumn<T>) => {
    const value = row[column.key];
    return column.render ? column.render(value, row) : value;
  };

  const totalColumns = columns.length + (actions.length > 0 ? 1 : 0);

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "12px",
        boxShadow: "0px 8px 24px rgba(6,36,36,0.06)",
      }}
    >
      <Table
        sx={{
          "& .MuiTableCell-root": {
            borderRight: "1px solid #E5E7EB",
            borderBottom: "none",
            "&:last-child": {
              borderRight: "none",
            },
            "&:nth-last-child(2)": actions.length > 0 ? {
              borderRight: "none",
            } : {},
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            borderRight: "none",
            borderBottom: "1px solid #E5E7EB",
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: headerBackgroundColor }}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align || "left"}
                sx={{
                  fontWeight: 700,
                  fontSize: "14px",
                  width: column.width,
                }}
              >
                {column.label}
              </TableCell>
            ))}
            {actions.length > 0 && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 8 }}>
                <Typography color="grey.700">
                  Carregando...
                </Typography>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 8 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography color="error" variant="h6" gutterBottom>
                    Erro ao carregar dados
                  </Typography>
                  <Typography color="grey.800" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  {onRetry && (
                    <Typography
                      component="button"
                      onClick={onRetry}
                      sx={{
                        color: "primary.main",
                        textDecoration: "underline",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        fontSize: "1rem",
                      }}
                    >
                      Tentar novamente
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 8 , border: 'none'}}>
                <Typography color="grey.700">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  "&:hover": {
                    bgcolor: "#F8F9FA",
                    cursor: onRowClick ? "pointer" : "default",
                  },
                }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || "left"}
                    sx={{
                      fontSize: "14px",
                    }}
                  >
                    {getCellValue(row, column)}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      {actions.map((action, actionIndex) => (
                        <IconButton
                          key={actionIndex}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row, e);
                          }}
                          title={action.tooltip}
                        >
                          {action.icon}
                        </IconButton>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!hidePagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </TableContainer>
  );
}