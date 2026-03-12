export interface INotificationRepository {
  /**
   * Envia um código OTP por email
   * @param email - Email do destinatário
   * @param otp - Código OTP
   * @param userName - Nome do usuário (opcional)
   * @param tenantName - Nome/slug do tenant para branding (opcional)
   */
  sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
    tenantName?: string,
  ): Promise<void>;

  /**
   * Envia um código OTP compactado SMS
   * @param phoneNumber - Número de telefone
   * @param otp - Código OTP
   */
  sendOtpSms?(phoneNumber: string, otp: string): Promise<void>;

  /**
   * Envia código de verificação para redefinição de senha
   * @param email - Email do destinatário
   * @param otp - Código de verificação
   * @param tenantName - Nome/slug do tenant para branding (opcional)
   */
  sendPasswordResetEmail(
    email: string,
    otp: string,
    tenantName?: string,
  ): Promise<void>;

  /**
   * Envia email de boas-vindas para novo admin
   * @param email - Email do destinatário
   * @param userName - Nome do usuário
   * @param userRole - Role do usuário
   * @param tenantName - Nome/slug do tenant para branding
   * @param temporaryPassword - Senha temporária
   * @param loginUrl - URL para login
   */
  sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void>;

  /**
   * Envia email de boas-vindas para novo beneficiário
   * @param email - Email do destinatário
   * @param userName - Nome do usuário
   * @param tenantName - Nome/slug do tenant para branding
   * @param temporaryPassword - Senha temporária
   * @param loginUrl - URL para login
   */
  sendWelcomeBeneficiaryEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void>;

  /**
   * Envia email de boas-vindas para novo médico
   * @param email - Email do destinatário
   * @param userName - Nome do usuário
   * @param tenantName - Nome/slug do tenant para branding
   * @param temporaryPassword - Senha temporária
   * @param loginUrl - URL para login
   * @param crm - CRM do médico (opcional)
   * @param specialty - Especialidade médica (opcional)
   */
  sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
  ): Promise<void>;

  /**
   * Envia email de contato do beneficiário para a Trya
   * @param toEmail - Email de destino (suporte Trya)
   * @param fromEmail - Email do beneficiário remetente
   * @param fromName - Nome do beneficiário remetente
   * @param tenantId - ID do tenant
   * @param subject - Assunto da mensagem
   * @param message - Corpo da mensagem
   */
  sendContactEmail(
    toEmail: string,
    fromEmail: string,
    fromName: string,
    tenantId: string,
    subject: string,
    message: string,
  ): Promise<void>;
}
