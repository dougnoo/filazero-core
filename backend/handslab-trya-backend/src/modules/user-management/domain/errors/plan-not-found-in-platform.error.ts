export class PlanNotFoundInPlatformError extends Error {
  constructor(planName: string) {
    super(
      `O plano "${planName}" não foi encontrado . Verifique com a Trya se este plano está disponível na plataforma.`,
    );
    this.name = 'PlanNotFoundInPlatformError';
  }
}
