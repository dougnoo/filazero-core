"use client";

import { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { documentService } from "./services/documentService";
import type {
  Document,
  FamilyMember,
  DocumentCatalogEntry,
  PaginatedDocuments,
  MedicalDocumentType,
  DocumentStatus,
} from "./types/document.types";
import { DocumentosContent } from "./components/DocumentosContent";
import { FamilyManagementLayout } from "@/app/(authenticated)/paciente/components/FamilyManagementLayout";

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginatedDocuments | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [catalog, setCatalog] = useState<DocumentCatalogEntry[]>([]);

  const [filterType, setFilterType] = useState<MedicalDocumentType | "">("");
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [membersResponse, catalogResponse] = await Promise.all([
          documentService.getMembers(),
          documentService.getCatalog(),
        ]);

        setMembers(membersResponse.members);
        setCatalog(catalogResponse.types);

        if (membersResponse.members.length > 0) {
          setSelectedMemberId(membersResponse.members[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!selectedMemberId) return;

    try {
      setIsLoading(true);
      const response = await documentService.list({
        memberUserId: selectedMemberId,
        type: filterType || undefined,
        status: filterStatus || undefined,
        q: searchQuery || undefined,
        issueDateFrom: dateFrom || undefined,
        issueDateTo: dateTo || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      setDocuments(response.data);
      setPagination(response);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      setDocuments([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMemberId, filterType, filterStatus, searchQuery, dateFrom, dateTo, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = () => {
    setCurrentPage(1);
    fetchDocuments();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    setCurrentPage(1);
  };

  const handleFilterChange = (
    type: MedicalDocumentType | "",
    status: DocumentStatus | "",
    query: string,
    from: string | null,
    to: string | null
  ) => {
    setFilterType(type);
    setFilterStatus(status);
    setSearchQuery(query);
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(1);
  };

  return (
    <FamilyManagementLayout
      activeTab="documentos"
      members={members}
      selectedMemberId={selectedMemberId}
      onSelectMember={handleMemberChange}
    >
      <Box sx={{ minHeight: 0 }}>
        <DocumentosContent
          documents={documents}
          pagination={pagination}
          currentPage={currentPage}
          isLoading={isLoading}
          members={members}
          selectedMemberId={selectedMemberId}
          catalog={catalog}
          filterType={filterType}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          dateFrom={dateFrom}
          dateTo={dateTo}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onUploadSuccess={handleUploadSuccess}
          onFilterChange={handleFilterChange}
        />
      </Box>
    </FamilyManagementLayout>
  );
}
