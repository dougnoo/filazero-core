import { Injectable, Logger } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class ConsoleNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(ConsoleNotificationRepository.name);

  constructor() {
    this.logger.warn(
      'Usando ConsoleNotificationRepository - NÃO USE EM PRODUÇÃO',
    );
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
    tenantName?: string,
  ): Promise<void> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║                    EMAIL OTP (CONSOLE)                     ║
╠════════════════════════════════════════════════════════════╣
║ Para: ${email.padEnd(50)} ║
║ Nome: ${(userName || 'N/A').padEnd(50)} ║
║ Tenant: ${(tenantName || 'default').padEnd(48)} ║
║ Código OTP: ${otp.padEnd(44)} ║
║ Tipo: Primeiro Acesso                                      ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║                    SMS OTP (CONSOLE)                       ║
╠════════════════════════════════════════════════════════════╣
║ Para: ${phoneNumber.padEnd(50)} ║
║ Código OTP: ${otp.padEnd(44)} ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  async sendPasswordResetEmail(
    email: string,
    otp: string,
    tenantName?: string,
  ): Promise<void> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║              EMAIL REDEFINIÇÃO SENHA (CONSOLE)             ║
╠════════════════════════════════════════════════════════════╣
║ Para: ${email.padEnd(50)} ║
║ Tenant: ${(tenantName || 'default').padEnd(48)} ║
║ Código OTP: ${otp.padEnd(44)} ║
║ Tipo: Redefinição de Senha                                 ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  async sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    temporaryPassword: string,
    loginUrl: string,
    tenantName?: string,
  ): Promise<void> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║              EMAIL BEM-VINDO ADMIN (CONSOLE)               ║
╠════════════════════════════════════════════════════════════╣
║ Para: ${email.padEnd(50)} ║
║ Nome: ${userName.padEnd(50)} ║
║ Cargo: ${userRole.padEnd(49)} ║
║ Tenant: ${(tenantName || 'default').padEnd(48)} ║
║ Senha Temporária: ${temporaryPassword.padEnd(39)} ║
║ URL Login: ${loginUrl.padEnd(46)} ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  async sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
    tenantName?: string,
  ): Promise<void> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║             EMAIL BEM-VINDO MÉDICO (CONSOLE)               ║
╠════════════════════════════════════════════════════════════╣
║ Para: ${email.padEnd(50)} ║
║ Nome: ${userName.padEnd(50)} ║
║ CRM: ${(crm || 'N/A').padEnd(51)} ║
║ Especialidade: ${(specialty || 'N/A').padEnd(42)} ║
║ Tenant: ${(tenantName || 'default').padEnd(48)} ║
║ Senha Temporária: ${temporaryPassword.padEnd(39)} ║
║ URL Login: ${loginUrl.padEnd(46)} ║
╚════════════════════════════════════════════════════════════╝
    `);
  }
}
