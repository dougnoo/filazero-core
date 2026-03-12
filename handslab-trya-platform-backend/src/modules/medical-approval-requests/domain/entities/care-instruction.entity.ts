export enum InstructionProvidedBy {
  AI = 'AI',
  DOCTOR = 'DOCTOR',
}

export class CareInstruction {
  id: string;
  medicalApprovalRequestId: string;
  instruction: string;
  providedBy: InstructionProvidedBy;
  createdAt: Date;

  constructor(data: {
    id?: string;
    medicalApprovalRequestId: string;
    instruction: string;
    providedBy: InstructionProvidedBy;
    createdAt?: Date;
  }) {
    this.id = data.id || '';
    this.medicalApprovalRequestId = data.medicalApprovalRequestId;
    this.instruction = data.instruction;
    this.providedBy = data.providedBy;
    this.createdAt = data.createdAt || new Date();
  }

  static create(data: {
    medicalApprovalRequestId?: string;
    instruction: string;
    providedBy: InstructionProvidedBy;
  }): CareInstruction {
    return new CareInstruction({
      medicalApprovalRequestId: data.medicalApprovalRequestId || '',
      instruction: data.instruction,
      providedBy: data.providedBy,
    });
  }
}
