import { Injectable } from '@nestjs/common';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { IAlertRule } from './alert-rule.interface';
import { AlertPayload, AlertType, AlertPriority, AlertContext } from './alert-types';
import { getDocumentTypeLabel } from '../../../documents/domain/catalog/document-catalog';

/**
 * Alert rule for documents expiring within the next 15 days
 */
@Injectable()
export class DocumentExpiringRule implements IAlertRule {
  private readonly THRESHOLD_DAYS = 15;

  async canGenerate(
    member: User,
    documents: MedicalDocument[],
  ): Promise<boolean> {
    return documents.some((doc) => this.isExpiringWithinThreshold(doc));
  }

  async generateAlert(
    member: User,
    documents: MedicalDocument[],
  ): Promise<AlertPayload | null> {
    const expiringDocs = documents
      .filter((doc) => this.isExpiringWithinThreshold(doc))
      .sort((a, b) => {
        const daysA = this.getDaysUntilExpiration(a);
        const daysB = this.getDaysUntilExpiration(b);
        return daysA - daysB;
      });

    if (expiringDocs.length === 0) {
      return null;
    }

    const doc = expiringDocs[0];
    const daysLeft = this.getDaysUntilExpiration(doc);
    const typeLabel = getDocumentTypeLabel(doc.documentType);
    const categoryName = this.getCategoryDisplayName(doc.category);

    // Determine priority based on days left
    let priority = AlertPriority.MEDIUM;
    if (daysLeft <= 3) {
      priority = AlertPriority.HIGH;
    }

    const message = this.buildHumanizedMessage(
      member,
      categoryName,
      typeLabel,
      daysLeft,
    );

    return {
      type: AlertType.DOCUMENT_EXPIRING,
      message,
      priority,
      category: doc.category,
      documentType: doc.documentType,
      expirationDaysLeft: daysLeft,
      entityId: doc.id,
    };
  }

  private isExpiringWithinThreshold(doc: MedicalDocument): boolean {
    if (!doc.validUntil) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expirationDate = new Date(doc.validUntil);
    expirationDate.setHours(0, 0, 0, 0);

    // Only alert for future dates (not already expired)
    if (expirationDate <= today) {
      return false;
    }

    const daysLeft = Math.floor(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysLeft <= this.THRESHOLD_DAYS && daysLeft > 0;
  }

  private getDaysUntilExpiration(doc: MedicalDocument): number {
    if (!doc.validUntil) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expirationDate = new Date(doc.validUntil);
    expirationDate.setHours(0, 0, 0, 0);

    return Math.floor(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private getCategoryDisplayName(category: string): string {
    // Simple mapping - can be enhanced with a catalog
    const categoryMap: Record<string, string> = {
      'Hemograma': 'hemograma',
      'Glicemia': 'glicemia',
      'Colesterol': 'colesterol',
      'Vacinação Gripe': 'vacinação da gripe',
      'Vacinação Covid': 'vacinação COVID-19',
      'Raio-X': 'radiografia',
      'Ultrassom': 'ultrassom',
      'Tomografia': 'tomografia',
      'Ressonância': 'ressonância magnética',
      'Densitometria': 'densitometria óssea',
    };

    return categoryMap[category] || category.toLowerCase();
  }

  private buildHumanizedMessage(
    member: User,
    categoryName: string,
    typeLabel: string,
    daysLeft: number,
  ): string {
    const memberRef = member.name.split(' ')[0]; // Use first name

    if (daysLeft <= 3) {
      return `O registro de ${categoryName} de ${memberRef} está próximo do vencimento - faltam ${daysLeft} dias. É importante manter a rotina de ${typeLabel} atualizada.`;
    }

    if (daysLeft <= 7) {
      return `O registro de ${categoryName} de ${memberRef} está se aproximando do vencimento em ${daysLeft} dias. Recomendamos atualizar a rotina de ${typeLabel}.`;
    }

    return `O registro de ${categoryName} de ${memberRef} está próximo do vencimento. É importante manter a rotina de ${typeLabel} atualizada.`;
  }
}
