"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ViewIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";
import {
  StatusChip,
  TablePagination,
  tableContainerStyles,
  tableCellStyles,
  tableHeaderRowStyles,
  emptyTableCellStyles,
} from "@/shared/components/Table";
import { FilePreviewDialog } from "@/shared/components/FilePreviewDialog";
import { documentService } from "../services/documentService";
import type { Document, PaginatedDocuments, DocumentStatus } from "../types/document.types";

interface DocumentListProps {
  documents: Document[];
  pagination: PaginatedDocuments | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (items: number) => void;
}

const statusColorMap: Record<string, { color: string; bgColor: string }> = {
  VALID: { color: "#041616", bgColor: "#BCDF84" },
  EXPIRED: { color: "#041616", bgColor: "#FECACA" },
};

const statusLabelMap: Record<DocumentStatus, string> = {
  VALID: "Válido",
  EXPIRED: "Vencido",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

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

export function DocumentList({
  documents,
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
}: DocumentListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(undefined);

  const handleView = (doc: Document) => {
    setPreviewUrl(doc.viewUrl);
    setPreviewFileName(doc.title);
    setPreviewOpen(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const result = await documentService.getDownloadUrl(doc.id);
      window.open(result.downloadUrl, "_blank");
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || documents.length;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        {documents.map((doc) => (
          <Box
            key={doc.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>
                {doc.title}
              </Typography>
              <StatusChip
                status={doc.status}
                label={statusLabelMap[doc.status] || doc.status}
                colorMap={statusColorMap}
                showArrow={false}
              />
            </Box>
            <Typography sx={{ fontSize: "13px", color: "grey.600", mb: 0.5 }}>
              {doc.documentTypeLabel} • {doc.category}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "grey.500", mb: 1 }}>
              {doc.memberName} • {formatDate(doc.issueDate)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Visualizar">
                <IconButton size="small" onClick={() => handleView(doc)}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton size="small" onClick={() => handleDownload(doc)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}

        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              gap: 1,
            }}
          >
            <IconButton
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={isFirstPage}
              sx={paginationButtonStyles(isFirstPage)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
              {currentPage} de {totalPages}
            </Typography>
            <IconButton
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={isLastPage}
              sx={paginationButtonStyles(isLastPage)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}

        <FilePreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileUrl={previewUrl || ""}
          fileName={previewFileName}
        />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer sx={tableContainerStyles}>
        <Table sx={tableCellStyles}>
          <TableHead>
            <TableRow sx={tableHeaderRowStyles}>
              <TableCell>Tipo</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Membro</TableCell>
              <TableCell>Emissão</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={emptyTableCellStyles}>
                  <Typography color="grey.800">Nenhum documento encontrado</Typography>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentTypeLabel}</TableCell>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.category}</TableCell>
                  <TableCell>{doc.memberName}</TableCell>
                  <TableCell>{formatDate(doc.issueDate)}</TableCell>
                  <TableCell>
                    <StatusChip
                      status={doc.status}
                      label={statusLabelMap[doc.status] || doc.status}
                      colorMap={statusColorMap}
                      showArrow={false}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Visualizar">
                      <IconButton size="small" onClick={() => handleView(doc)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small" onClick={() => handleDownload(doc)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {documents.length > 0 && (
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

      <FilePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewUrl || ""}
        fileName={previewFileName}
      />
    </Box>
  );
}
