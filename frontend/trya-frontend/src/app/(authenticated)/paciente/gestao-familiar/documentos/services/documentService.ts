import { api } from "@/shared/services/api";
import { buildQueryParams } from "@/shared/utils";
import type {
  FamilyMembersResponse,
  DocumentCatalogResponse,
  DocumentDetail,
  DocumentDownload,
  PaginatedDocuments,
  ListDocumentsParams,
  UploadDocumentData,
} from "../types/document.types";

class DocumentService {
  private baseURL = "/api/documents";

  async getMembers(): Promise<FamilyMembersResponse> {
    return await api.get<FamilyMembersResponse>(
      `${this.baseURL}/members`,
      "Erro ao buscar membros da família"
    );
  }

  async getCatalog(): Promise<DocumentCatalogResponse> {
    return await api.get<DocumentCatalogResponse>(
      `${this.baseURL}/catalog`,
      "Erro ao buscar catálogo de documentos"
    );
  }

  async list(params: ListDocumentsParams): Promise<PaginatedDocuments> {
    const queryString = buildQueryParams({
      memberUserId: params.memberUserId,
      type: params.type,
      status: params.status,
      q: params.q,
      issueDateFrom: params.issueDateFrom,
      issueDateTo: params.issueDateTo,
      page: params.page,
      limit: params.limit,
    });

    return await api.get<PaginatedDocuments>(
      `${this.baseURL}${queryString}`,
      "Erro ao listar documentos"
    );
  }

  async getById(id: string): Promise<DocumentDetail> {
    return await api.get<DocumentDetail>(
      `${this.baseURL}/${id}`,
      "Erro ao buscar documento"
    );
  }

  async getDownloadUrl(id: string): Promise<DocumentDownload> {
    return await api.get<DocumentDownload>(
      `${this.baseURL}/${id}/download`,
      "Erro ao gerar link de download"
    );
  }

  async upload(data: UploadDocumentData): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("memberUserId", data.memberUserId);
    formData.append("documentType", data.documentType);
    formData.append("category", data.category);
    formData.append("title", data.title);
    formData.append("issueDate", data.issueDate);

    if (data.validUntil) {
      formData.append("validUntil", data.validUntil);
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }

    return await api.post<{ id: string }>(
      `${this.baseURL}/upload`,
      formData,
      "Erro ao fazer upload do documento"
    );
  }

  async delete(id: string): Promise<void> {
    await api.del(`${this.baseURL}/${id}`, "Erro ao remover documento");
  }
}

export const documentService = new DocumentService();
