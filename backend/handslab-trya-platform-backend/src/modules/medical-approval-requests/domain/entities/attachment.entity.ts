export class Attachment {
  id: string;
  medicalApprovalRequestId: string;
  s3Key: string;
  originalName: string;
  fileType: string;
  createdAt: Date;

  private constructor(data: {
    id?: string;
    medicalApprovalRequestId?: string;
    s3Key: string;
    originalName: string;
    fileType?: string;
    createdAt?: Date;
  }) {
    this.id = data.id || '';
    this.medicalApprovalRequestId = data.medicalApprovalRequestId || '';
    this.s3Key = data.s3Key;
    this.originalName = data.originalName;
    this.fileType = data.fileType || 'image';
    this.createdAt = data.createdAt || new Date();
  }

  // Factory method for creating new attachments
  static create(data: {
    s3Key: string;
    originalName: string;
    fileType?: string;
  }): Attachment {
    return new Attachment(data);
  }

  // Factory method for reconstituting from persistence
  static reconstitute(data: {
    id: string;
    medicalApprovalRequestId: string;
    s3Key: string;
    originalName: string;
    fileType: string;
    createdAt: Date;
  }): Attachment {
    return new Attachment(data);
  }
}
