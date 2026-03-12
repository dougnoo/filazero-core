export interface IPlanValidationService {
  /**
   * Valida se o plano existe na API da plataforma
   * @param planName Nome do plano a ser validado (ex: "AMIL - Plano Saúde")
   * @returns true se o plano existe na plataforma, false caso contrário
   */
  validatePlanExists(planName: string): Promise<boolean>;
}
