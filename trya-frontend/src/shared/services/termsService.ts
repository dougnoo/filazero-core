interface Term {
  id: string;
  type: "TERMS_OF_USE" | "PRIVACY_POLICY";
  version: string;
  s3Url: string;
  isActive: boolean;
  createdAt: string;
}

class TermsService {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  /**
   * Busca os termos mais recentes (ativos)
   */
  async getLatestTerms(): Promise<Term[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/terms/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro ao buscar termos: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca um termo específico por tipo
   */
  async getTermByType(
    type: "TERMS_OF_USE" | "PRIVACY_POLICY"
  ): Promise<Term | null> {
    try {
      const terms = await this.getLatestTerms();
      return terms.find((term) => term.type === type) || null;
    } catch (error) {
      throw error;
    }
  }
}

export const termsService = new TermsService();
export type { Term };
