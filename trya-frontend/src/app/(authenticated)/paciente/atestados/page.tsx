"use client";

import { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { certificateService } from "./services/certificateService";
import type {
  Certificate,
  PaginatedCertificates,
} from "./types/certificate.types";
import { PatientCard } from "../components/PatientCard";
import { AtestadosContent } from "./components/AtestadosContent";
import BackButton from "@/shared/components/BackButton";

export default function AtestadosPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [pagination, setPagination] = useState<PaginatedCertificates | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Buscar atestados
  const fetchCertificates = useCallback(async (page: number, date?: string | null) => {
    try {
      setIsLoading(true);
      const response = await certificateService.list(page, itemsPerPage, date || undefined);
      setCertificates(response.data);
      setPagination(response);
    } catch (error) {
      console.error("Erro ao carregar atestados:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates(currentPage, dateFilter);
  }, [currentPage, dateFilter, fetchCertificates]);

  const handleUploadSuccess = () => {
    fetchCertificates(1, dateFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDateFilter = (date: string | null) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Sidebar Esquerda - Cards do Paciente */}
      <Box
        sx={{
          width: { xs: "100%", lg: 320 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 3 },
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
          maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
          overflowY: { xs: "visible", lg: "auto" },
          overflowX: "hidden",
          pr: { lg: 1 },
          pb: { lg: 2 },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#9CA3AF",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "#6B7280",
            },
          },
        }}
      >
        <BackButton />
        <PatientCard />
      </Box>

      {/* Área Principal - Conteúdo de Atestados */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          order: { xs: 1, lg: 2 },
          height: "100%",
          minHeight: 0,
        }}
      >
        <AtestadosContent
          certificates={certificates}
          pagination={pagination}
          currentPage={currentPage}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onUploadSuccess={handleUploadSuccess}
          onDateFilter={handleDateFilter}
        />
      </Box>
    </Box>
  );
}
