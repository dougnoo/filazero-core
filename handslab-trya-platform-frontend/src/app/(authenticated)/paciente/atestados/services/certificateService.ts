import { api } from "@/shared/services/api";
import type { Certificate, CertificateDetail, PaginatedCertificates } from "../types/certificate.types";

export interface UploadCertificateData {
  file: File;
}

class CertificateService {
  private baseURL = "/api/medical-certificates";

  /**
   * Lista os atestados do beneficiário autenticado
   */
  async list(page: number = 1, limit: number = 10): Promise<PaginatedCertificates> {
    return await api.get<PaginatedCertificates>(
      `${this.baseURL}?page=${page}&limit=${limit}`,
      "Erro ao listar atestados"
    );
  }

  /**
   * Busca detalhes de um atestado específico
   */
  async getById(id: string): Promise<CertificateDetail> {
    return await api.get<CertificateDetail>(
      `${this.baseURL}/${id}`,
      "Erro ao buscar atestado"
    );
  }

  /**
   * Faz upload de um novo atestado
   */
  async upload(data: UploadCertificateData): Promise<Certificate> {
    const formData = new FormData();
    formData.append("file", data.file);

    return await api.post<Certificate>(
      `${this.baseURL}/upload`,
      formData,
      "Erro ao fazer upload do atestado"
    );
  }

  /**
   * Deleta um atestado
   */
  async delete(id: string): Promise<void> {
    await api.del(`${this.baseURL}/${id}`, "Erro ao deletar atestado");
  }
}

export const certificateService = new CertificateService();

