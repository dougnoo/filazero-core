import { Injectable } from '@nestjs/common';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { IAlertRule } from './alert-rule.interface';
import { AlertPayload, AlertType, AlertPriority } from './alert-types';

/**
 * Alert rule for missing routine exams (lab exams not performed in a certain time)
 */
@Injectable()
export class MissingExamRule implements IAlertRule {
  private readonly THRESHOLD_MONTHS = 12;

  async canGenerate(
    member: User,
    documents: MedicalDocument[],
  ): Promise<boolean> {
    const labDocs = documents.filter(
      (doc) => doc.documentType === MedicalDocumentType.LAB_EXAM,
    );

    // No lab exams at all
    if (labDocs.length === 0) {
      return true;
    }

    // Check if most recent exam is older than threshold
    const mostRecentExam = labDocs.sort(
      (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    )[0];

    const monthsSinceExam = this.getMonthsSinceDate(mostRecentExam.issueDate);
    return monthsSinceExam > this.THRESHOLD_MONTHS;
  }

  async generateAlert(
    member: User,
    documents: MedicalDocument[],
  ): Promise<AlertPayload | null> {
    const canGenerate = await this.canGenerate(member, documents);
    if (!canGenerate) {
      return null;
    }

    const labDocs = documents.filter(
      (doc) => doc.documentType === MedicalDocumentType.LAB_EXAM,
    );

    const memberRef = member.name.split(' ')[0];

    let message: string;
    if (labDocs.length === 0) {
      message = `Não há registros de exames laboratoriais para ${memberRef}. É recomendável realizar exames de rotina periodicamente.`;
    } else {
      const monthsSinceExam = this.getMonthsSinceDate(labDocs[0].issueDate);
      message = `O último exame laboratorial registrado de ${memberRef} foi há ${monthsSinceExam} meses. Recomendamos consultar seu médico para avaliar a necessidade de novos exames.`;
    }

    return {
      type: AlertType.MISSING_EXAM,
      message,
      priority: AlertPriority.LOW,
      category: 'Exames Laboratoriais',
      documentType: MedicalDocumentType.LAB_EXAM,
    };
  }

  private getMonthsSinceDate(date: Date): number {
    const now = new Date();
    let months = (now.getFullYear() - date.getFullYear()) * 12;
    months += now.getMonth() - date.getMonth();
    return Math.max(0, months);
  }
}
