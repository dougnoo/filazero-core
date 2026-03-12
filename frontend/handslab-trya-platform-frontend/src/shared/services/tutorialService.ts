import { api } from "./api";

export interface Tutorial {
  id: string;
  code: string;
  title: string;
  description: string;
  version: string;
  order: number;
}

export interface CompleteTutorialResponse {
  success: boolean;
  tutorialId: string;
}

class TutorialService {
  async getPendingTutorials(): Promise<Tutorial[]> {
    try {
      const response = await api.get<Tutorial[]>("/api/tutorials/pending", null);
      return response || [];
    } catch {
      return [];
    }
  }

  async completeTutorial(
    tutorialId: string,
    skipped = false
  ): Promise<CompleteTutorialResponse> {
    return api.post<CompleteTutorialResponse>(
      `/api/tutorials/${tutorialId}/complete`,
      { skipped },
      "Erro ao completar tutorial"
    );
  }

  async hasPendingTutorial(code: string): Promise<Tutorial | null> {
    const tutorials = await this.getPendingTutorials();
    return tutorials.find((tutorial) => tutorial.code === code) || null;
  }
}

export const tutorialService = new TutorialService();

