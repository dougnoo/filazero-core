/**
 * Entidade que representa a configuração de tema de um tenant
 */
export interface ThemeConfig {
  /**
   * Nome do tenant (ex: "Trya", "Grupo Trigo")
   */
  name?: string;

  /**
   * Cor primária do tema (ex: "#FF5733")
   */
  primaryColor: string;

  /**
   * Cor secundária do tema (ex: "#33FF57")
   */
  secondaryColor: string;

  /**
   * Cor de fundo secundária do tema (ex: "#FBF1E7")
   */
  backgroundSecondaryColor?: string;

  /**
   * Nome do arquivo do logo (ex: "logo.png")
   */
  logo: string;

  /**
   * Nome do arquivo do favicon (ex: "favicon.ico")
   */
  favicon: string;

  /**
   * Nome do arquivo do background de login (ex: "background.jpg")
   */
  loginBackground: string;

  /**
   * Nome do arquivo do banner do dashboard do paciente (ex: "banner_dashboard_paciente.svg")
   */
  bannerDashboard?: string;

  /**
   * Nome do arquivo do banner do dashboard do paciente em dispositivos mobile (ex: "banner_dashboard_paciente_mobile.svg")
   */
  bannerDashboardMobile?: string;

  /**
   * Nome do arquivo da ilustração da tela final do onboarding (ex: "onboarding-final.svg")
   */
  onboardingFinalIllustration?: string;
}
