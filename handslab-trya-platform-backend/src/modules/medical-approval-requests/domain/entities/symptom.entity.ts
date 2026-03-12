export class Symptom {
  id: string;
  medicalApprovalRequestId: string;
  description: string;
  isMain: boolean;
  createdAt: Date;

  constructor(data: {
    id?: string;
    medicalApprovalRequestId: string;
    description: string;
    isMain: boolean;
    createdAt?: Date;
  }) {
    this.id = data.id || '';
    this.medicalApprovalRequestId = data.medicalApprovalRequestId;
    this.description = data.description;
    this.isMain = data.isMain;
    this.createdAt = data.createdAt || new Date();
  }

  static create(data: {
    medicalApprovalRequestId?: string;
    description: string;
    isMain: boolean;
  }): Symptom {
    return new Symptom({
      medicalApprovalRequestId: data.medicalApprovalRequestId || '',
      description: data.description,
      isMain: data.isMain,
    });
  }
}
