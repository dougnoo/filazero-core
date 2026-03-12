export enum ExamSuggestedBy {
  AI = 'AI',
  DOCTOR = 'DOCTOR',
}

export class SuggestedExam {
  id: string;
  medicalApprovalRequestId: string;
  examName: string;
  suggestedBy: ExamSuggestedBy;
  createdAt: Date;

  constructor(data: {
    id?: string;
    medicalApprovalRequestId: string;
    examName: string;
    suggestedBy: ExamSuggestedBy;
    createdAt?: Date;
  }) {
    this.id = data.id || '';
    this.medicalApprovalRequestId = data.medicalApprovalRequestId;
    this.examName = data.examName;
    this.suggestedBy = data.suggestedBy;
    this.createdAt = data.createdAt || new Date();
  }

  static create(data: {
    medicalApprovalRequestId?: string;
    examName: string;
    suggestedBy: ExamSuggestedBy;
  }): SuggestedExam {
    return new SuggestedExam({
      medicalApprovalRequestId: data.medicalApprovalRequestId || '',
      examName: data.examName,
      suggestedBy: data.suggestedBy,
    });
  }
}
