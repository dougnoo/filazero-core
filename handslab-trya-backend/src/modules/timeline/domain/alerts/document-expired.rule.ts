import { Injectable } from '@nestjs/common';
import { MedicalDocument } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { IAlertRule } from './alert-rule.interface';
import { AlertPayload, AlertType, AlertPriority } from './alert-types';
import { getDocumentTypeLabel } from '../../../documents/domain/catalog/document-catalog';

/**
 * Alert rule for documents that have already expired
 */
@Injectable()
export class DocumentExpiredRule implements IAlertRule {
  async canGenerate(
    member: User,
    documents: MedicalDocument[],
  ): Promise<boolean> {
    return documents.some((doc) => this.isExpired(doc));
  }

  async generateAlert(
    member: User,
    documents: MedicalDocument[],
  ): Promise<AlertPayload | null> {
    const expiredDocs = documents.filter((doc) => this.isExpired(doc));

    if (expiredDocs.length === 0) {
      return null;
    }

    // Sort by most recently expired first
    const doc = expiredDocs.sort((a, b) => {
      const dateA = new Date(a.validUntil || 0).getTime();
      const dateB = new Date(b.validUntil || 0).getTime();
      return dateB - dateA;
    })[0];

    const typeLabel = getDocumentTypeLabel(doc.documentType);
    const categoryName = this.getCategoryDisplayName(doc.category);
    const memberRef = member.name.split(' ')[0];

    const message = `O registro de ${categoryName} de ${memberRef} está vencido. É necessário renovar a rotina de ${typeLabel} para manter a saúde em dia.`;

    return {
      type: AlertType.DOCUMENT_EXPIRED,
      message,
      priority: AlertPriority.HIGH,
      category: doc.category,
      documentType: doc.documentType,
      entityId: doc.id,
    };
  }

  private isExpired(doc: MedicalDocument): boolean {
    if (!doc.validUntil) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expirationDate = new Date(doc.validUntil);
    expirationDate.setHours(0, 0, 0, 0);

    return expirationDate < today;
  }

  private getCategoryDisplayName(category: string): string {
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
}
