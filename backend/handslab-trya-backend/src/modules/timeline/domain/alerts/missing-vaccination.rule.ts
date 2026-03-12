import { Injectable } from '@nestjs/common';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { IAlertRule } from './alert-rule.interface';
import { AlertPayload, AlertType, AlertPriority } from './alert-types';

/**
 * Alert rule for missing vaccinations (none within last 6 months or none at all)
 */
@Injectable()
export class MissingVaccinationRule implements IAlertRule {
  private readonly THRESHOLD_MONTHS = 6;

  async canGenerate(
    member: User,
    documents: MedicalDocument[],
  ): Promise<boolean> {
    const vaccinationDocs = documents.filter(
      (doc) => doc.documentType === MedicalDocumentType.VACCINATION,
    );

    // No vaccinations at all
    if (vaccinationDocs.length === 0) {
      return true;
    }

    // Check if most recent vaccination is older than threshold
    const mostRecentVaccination = vaccinationDocs.sort(
      (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    )[0];

    const monthsSinceVaccination = this.getMonthsSinceDate(
      mostRecentVaccination.issueDate,
    );
    return monthsSinceVaccination > this.THRESHOLD_MONTHS;
  }

  async generateAlert(
    member: User,
    documents: MedicalDocument[],
  ): Promise<AlertPayload | null> {
    const canGenerate = await this.canGenerate(member, documents);
    if (!canGenerate) {
      return null;
    }

    const vaccinationDocs = documents.filter(
      (doc) => doc.documentType === MedicalDocumentType.VACCINATION,
    );

    const memberRef = member.name.split(' ')[0];

    let message: string;
    if (vaccinationDocs.length === 0) {
      message = `Não há registros de vacinação para ${memberRef}. Consulte seu médico para verificar quais vacinas são recomendadas.`;
    } else {
      const monthsSinceVaccination = this.getMonthsSinceDate(
        vaccinationDocs[0].issueDate,
      );
      message = `A última vacinação registrada de ${memberRef} foi há ${monthsSinceVaccination} meses. É recomendável verificar a necessidade de atualizar o calendário de vacinação.`;
    }

    return {
      type: AlertType.MISSING_VACCINATION,
      message,
      priority: AlertPriority.MEDIUM,
      category: 'Vacinação',
      documentType: MedicalDocumentType.VACCINATION,
    };
  }

  private getMonthsSinceDate(date: Date): number {
    const now = new Date();
    let months = (now.getFullYear() - date.getFullYear()) * 12;
    months += now.getMonth() - date.getMonth();
    return Math.max(0, months);
  }
}
