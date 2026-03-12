import { Injectable, Logger } from '@nestjs/common';
import { INotificationRepository } from '../../../../shared/domain/repositories/notification.repository.interface';

/**
 * Implementação de notificação que apenas loga no console
 *
 * NOTA: Esta implementação é apenas para desenvolvimento/testes.
 * Em produção, use um serviço real como:
 * - AWS SES (Simple Email Service) para emails
 * - AWS SNS (Simple Notification Service) para SMS
 * - SendGrid, Mailgun, etc.
 */
@Injectable()
export class ConsoleNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(ConsoleNotificationRepository.name);

  async sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
    tenantName?: string,
  ): Promise<void> {
    const greeting = userName ? `Olá ${userName}` : 'Olá';

    this.logger.log('='.repeat(60));
    this.logger.log('📧 ENVIANDO EMAIL DE OTP');
    this.logger.log('='.repeat(60));
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Código de verificação para trocar senha`);
    this.logger.log('');
    this.logger.log(`${greeting},`);
    this.logger.log('');
    this.logger.log('Você está no processo de troca de senha.');
    this.logger.log('Use o código abaixo para completar a operação:');
    this.logger.log('');
    this.logger.log(`      Código: ${otp}`);
    this.logger.log('');
    this.logger.log('Este código é válido por 5 minutos.');
    this.logger.log('Se você não solicitou esta alteração, ignore este email.');
    this.logger.log('='.repeat(60));
  }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
    this.logger.log('='.repeat(60));
    this.logger.log('📱 ENVIANDO SMS DE OTP');
    this.logger.log('='.repeat(60));
    this.logger.log(`Para: ${phoneNumber}`);
    this.logger.log(`Mensagem: Seu código de verificação é: ${otp}`);
    this.logger.log('Válido por 5 minutos.');
    this.logger.log('='.repeat(60));
  }

  async sendPasswordResetEmail(
    email: string,
    otp: string,
    tenantName?: string,
  ): Promise<void> {
    this.logger.log('='.repeat(60));
    this.logger.log('🔑 ENVIANDO EMAIL DE REDEFINIÇÃO DE SENHA');
    this.logger.log('='.repeat(60));
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Código para redefinir sua senha`);
    this.logger.log('');
    this.logger.log('Olá,');
    this.logger.log('');
    this.logger.log('Você solicitou a redefinição da sua senha.');
    this.logger.log('Use o código abaixo para definir uma nova senha:');
    this.logger.log('');
    this.logger.log(`      Código: ${otp}`);
    this.logger.log('');
    this.logger.log('Este código é válido por 10 minutos.');
    this.logger.log('Se você não solicitou esta alteração, ignore este email.');
    this.logger.log('='.repeat(60));
  }

  async sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log('🎉 ENVIANDO EMAIL DE BOAS-VINDAS PARA ADMIN');
    this.logger.log('='.repeat(80));
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Bem-vindo(a) ao HandsLab!`);
    this.logger.log('');
    this.logger.log(`🎉 Olá ${userName}!`);
    this.logger.log('');
    this.logger.log(
      'É com grande prazer que damos as boas-vindas ao HandsLab!',
    );
    this.logger.log('');
    this.logger.log(`Sua conta de ${userRole} foi criada com sucesso.`);
    this.logger.log(
      'Abaixo estão suas credenciais temporárias para o primeiro acesso:',
    );
    this.logger.log('');
    this.logger.log(`📧 Email: ${email}`);
    this.logger.log(`🔑 Senha Temporária: ${temporaryPassword}`);
    this.logger.log(`🏢 Empresa: ${tenantName}`);
    this.logger.log('');
    this.logger.log('⚠️ IMPORTANTE:');
    this.logger.log(
      'Esta é uma senha temporária que deve ser alterada no seu primeiro login.',
    );
    this.logger.log('');
    this.logger.log('📋 PRÓXIMOS PASSOS:');
    this.logger.log('1. Acesse o sistema usando suas credenciais temporárias');
    this.logger.log('2. Você será solicitado a alterar sua senha');
    this.logger.log('3. Configure seu perfil pessoal');
    this.logger.log(
      '4. Explore as funcionalidades disponíveis para sua função',
    );
    this.logger.log('');
    this.logger.log(`🚀 Link para login: ${loginUrl}`);
    this.logger.log('');
    this.logger.log(
      'Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato.',
    );
    this.logger.log('='.repeat(80));
  }

  async sendWelcomeBeneficiaryEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log('🏥 ENVIANDO EMAIL DE BOAS-VINDAS PARA BENEFICIÁRIO');
    this.logger.log('='.repeat(80));
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Bem-vindo(a) ao HandsLab - Seu Plano de Saúde!`);
    this.logger.log('');
    this.logger.log(`🏥 Olá ${userName}!`);
    this.logger.log('');
    this.logger.log(
      'É com grande alegria que damos as boas-vindas ao HandsLab!',
    );
    this.logger.log('');
    this.logger.log('Sua conta de Beneficiário foi criada com sucesso.');
    this.logger.log(
      `Você agora tem acesso ao seu plano de saúde oferecido pelo broker ${tenantName}.`,
    );
    this.logger.log('');
    this.logger.log('🏢 SEU BROKER DE SAÚDE:');
    this.logger.log(`${tenantName} está cuidando da sua saúde e bem-estar.`);
    this.logger.log('');
    this.logger.log(`📧 Email: ${email}`);
    this.logger.log(`🔑 Senha Temporária: ${temporaryPassword}`);
    this.logger.log('');
    this.logger.log('🏥 BENEFÍCIOS DO SEU PLANO:');
    this.logger.log('Acesso completo à plataforma de saúde');
    this.logger.log('Agendamento de consultas médicas');
    this.logger.log('Histórico médico digital');
    this.logger.log('Telemedicina e consultas online');
    this.logger.log('Acompanhamento de exames e resultados');
    this.logger.log('Suporte 24/7 da equipe médica');
    this.logger.log('');
    this.logger.log('⚠️ IMPORTANTE:');
    this.logger.log(
      'Esta é uma senha temporária que deve ser alterada no seu primeiro login.',
    );
    this.logger.log('');
    this.logger.log('📋 PRÓXIMOS PASSOS:');
    this.logger.log(
      '1. Acesse a plataforma usando suas credenciais temporárias',
    );
    this.logger.log('2. Altere sua senha para uma mais segura');
    this.logger.log('3. Complete seu perfil de saúde');
    this.logger.log('4. Explore os serviços disponíveis no seu plano');
    this.logger.log('5. Agende sua primeira consulta se necessário');
    this.logger.log('');
    this.logger.log(`🏥 Link para acesso: ${loginUrl}`);
    this.logger.log('');
    this.logger.log(
      'Se você tiver alguma dúvida sobre seu plano de saúde ou precisar de ajuda,',
    );
    this.logger.log(
      'nossa equipe de suporte está sempre disponível para atendê-lo.',
    );
    this.logger.log('');
    this.logger.log('Seu bem-estar é nossa prioridade! 💚');
    this.logger.log('='.repeat(80));
  }

  async sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
  ): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log('👨‍⚕️ ENVIANDO EMAIL DE BOAS-VINDAS PARA MÉDICO');
    this.logger.log('='.repeat(80));
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Bem-vindo ao HandsLab - Dr. ${userName}!`);
    this.logger.log('');
    this.logger.log(`👨‍⚕️ Olá Dr. ${userName}!`);
    this.logger.log('');
    this.logger.log(
      'É com grande alegria que damos as boas-vindas ao HandsLab!',
    );
    this.logger.log('');
    this.logger.log('Sua conta médica foi criada com sucesso.');
    this.logger.log(
      `Você agora tem acesso completo à plataforma de gestão médica em ${tenantName}.`,
    );
    this.logger.log('');
    this.logger.log('🏥 INFORMAÇÕES DO MÉDICO:');
    this.logger.log(`Nome: Dr. ${userName}`);
    this.logger.log(`Email: ${email}`);
    this.logger.log(`Escopo de Atuação: ${tenantName}`);
    if (crm) this.logger.log(`CRM: ${crm}`);
    if (specialty) this.logger.log(`Especialidade: ${specialty}`);
    this.logger.log('');
    this.logger.log(`📧 Email: ${email}`);
    this.logger.log(`🔑 Senha Temporária: ${temporaryPassword}`);
    this.logger.log('');
    this.logger.log('🎯 RECURSOS DISPONÍVEIS PARA MÉDICOS:');
    this.logger.log('Gestão completa de pacientes');
    this.logger.log('Prontuários eletrônicos');
    this.logger.log('Agendamento de consultas');
    this.logger.log('Solicitação de exames');
    this.logger.log('Prescrição de medicamentos');
    this.logger.log('Relatórios e análises');
    this.logger.log('Comunicação com pacientes');
    this.logger.log('Segurança e conformidade LGPD');
    this.logger.log('');
    this.logger.log('⚠️ IMPORTANTE:');
    this.logger.log(
      'Esta é uma senha temporária que deve ser alterada no seu primeiro login.',
    );
    this.logger.log('');
    this.logger.log('📋 PRÓXIMOS PASSOS:');
    this.logger.log(
      '1. Acesse a plataforma usando suas credenciais temporárias',
    );
    this.logger.log('2. Altere sua senha para uma mais segura');
    this.logger.log('3. Complete seu perfil médico profissional');
    this.logger.log('4. Configure suas preferências de atendimento');
    this.logger.log('5. Comece a usar os recursos da plataforma');
    this.logger.log('');
    this.logger.log(`👨‍⚕️ Link para acesso: ${loginUrl}`);
    this.logger.log('');
    this.logger.log(
      'Se você tiver alguma dúvida sobre a plataforma ou precisar de ajuda,',
    );
    this.logger.log(
      'nossa equipe de suporte está sempre disponível para atendê-lo.',
    );
    this.logger.log('');
    this.logger.log('Sua excelência médica é nossa prioridade! 🏥');
    this.logger.log('='.repeat(80));
  }

  async sendContactEmail(
    toEmail: string,
    fromEmail: string,
    fromName: string,
    tenantId: string,
    subject: string,
    message: string,
  ): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log('📩 ENVIANDO EMAIL DE CONTATO');
    this.logger.log('='.repeat(80));
    this.logger.log(`Para: ${toEmail}`);
    this.logger.log(`Responder para: ${fromEmail}`);
    this.logger.log(`De: ${fromName} <${fromEmail}>`);
    this.logger.log(`Tenant ID: ${tenantId}`);
    this.logger.log(`Assunto: [Contato] ${subject}`);
    this.logger.log('');
    this.logger.log('📝 MENSAGEM:');
    this.logger.log('-'.repeat(40));
    this.logger.log(message);
    this.logger.log('-'.repeat(40));
    this.logger.log('');
    this.logger.log('Esta mensagem foi enviada através da plataforma Trya.');
    this.logger.log('='.repeat(80));
  }
}
