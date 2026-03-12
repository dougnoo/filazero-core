import { NotificationCategory } from '../../domain/enums/notification-category.enum';

export class NotificationMessageHelper {
  static getTitle(category: string): string {
    if (category === NotificationCategory.TRIAGE_FINISHED) {
      return 'Exame disponível';
    }
    return 'Notificação';
  }

  static getMessage(category: string): string {
    if (category === NotificationCategory.TRIAGE_FINISHED) {
      return 'O médico respondeu à sua triagem e enviou o pedido de exame. Clique para visualizar na conversa.';
    }
    return 'Você tem uma nova notificação.';
  }
}
