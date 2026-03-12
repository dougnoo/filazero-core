import { api } from "@/shared/services/api";
import type { Certificate, CertificateDetail, PaginatedCertificates } from "../types/certificate.types";

export interface UploadCertificateData {
  file: File;
  observations?: string;
  title: string;
}

class CertificateService {
  private baseURL = "/api/medical-certificates";

  /**
   * Lista os atestados do beneficiário autenticado
   */
  async list(page: number = 1, limit: number = 10, date?: string): Promise<PaginatedCertificates> {
    let url = `${this.baseURL}?page=${page}&limit=${limit}`;
    if (date) {
      url += `&date=${date}`;
    }
    return await api.get<PaginatedCertificates>(
      url,
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
    if (data.observations) {
      formData.append("observations", data.observations);
    }
    
    formData.append("title", data.title);

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

