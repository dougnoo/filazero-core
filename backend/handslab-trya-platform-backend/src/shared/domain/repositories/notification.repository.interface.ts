export interface INotificationRepository {
  /**
   * Envia email com código OTP para primeiro acesso
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
   * Envia SMS com código OTP (opcional)
   */
  sendOtpSms(phoneNumber: string, otp: string): Promise<void>;

  /**
   * Envia email com código OTP para redefinição de senha
   * @param email - Email do destinatário
   * @param otp - Código OTP
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
   * @param temporaryPassword - Senha temporária
   * @param loginUrl - URL para login
   * @param tenantName - Nome/slug do tenant para branding (opcional)
   */
  sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    temporaryPassword: string,
    loginUrl: string,
    tenantName?: string,
  ): Promise<void>;

  /**
   * Envia email de boas-vindas para novo médico
   * @param email - Email do destinatário
   * @param userName - Nome do usuário
   * @param temporaryPassword - Senha temporária
   * @param loginUrl - URL para login
   * @param crm - CRM do médico (opcional)
   * @param specialty - Especialidade médica (opcional)
   * @param tenantName - Nome/slug do tenant para branding (opcional)
   */
  sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
    tenantName?: string,
  ): Promise<void>;
}
