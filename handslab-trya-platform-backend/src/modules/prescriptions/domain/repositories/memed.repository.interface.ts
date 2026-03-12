export interface MemedCredentials {
  apiKey: string;
  secretKey: string;
  userToken?: string; // Token do prescritor
}

export interface MemedSendPrescriptionVia {
  email?: string;
  sms?: string;
  whatsapp?: string;
}

export interface MemedPrescriptionDetail {
  id: number;
  token: string;
  data: any; // Estrutura completa da prescrição retornada pela Memed
}

export interface MemedDigitalPrescriptionLink {
  link: string;
  unlockCode: string;
}

export interface MemedListPrescriptionsOptions {
  limit?: number;
  offset?: number;
  initialDate?: string; // YYYY-MM-DD
  finalDate?: string; // YYYY-MM-DD
}

export interface MemedPrescriptionsList {
  data: any[]; // Lista de prescrições
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

/**
 * Repository interface para integração com API Memed
 */
export interface IMemedRepository {
  /**
   * Busca detalhes de uma prescrição
   */
  getPrescriptionDetails(
    prescriptionId: string,
    credentials: MemedCredentials,
    structuredDocuments?: boolean,
  ): Promise<MemedPrescriptionDetail>;

  /**
   * Busca URL do PDF da prescrição
   */
  getPrescriptionPDF(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<string>;

  /**
   * Gera link digital da prescrição com código de desbloqueio
   */
  getDigitalPrescriptionLink(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<MemedDigitalPrescriptionLink>;

  /**
   * Envia prescrição via email, SMS ou WhatsApp
   */
  sendPrescription(
    prescriptionId: string,
    sendData: MemedSendPrescriptionVia,
    credentials: MemedCredentials,
  ): Promise<void>;

  /**
   * Lista prescrições com paginação e filtros
   */
  listPrescriptions(
    credentials: MemedCredentials,
    options?: MemedListPrescriptionsOptions,
  ): Promise<MemedPrescriptionsList>;

  /**
   * Deleta uma prescrição
   */
  deletePrescription(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<void>;

  /**
   * Valida se um token de prescrição é válido
   */
  validateToken(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<boolean>;
}
