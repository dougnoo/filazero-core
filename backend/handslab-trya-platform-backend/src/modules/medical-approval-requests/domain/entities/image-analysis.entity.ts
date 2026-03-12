export class ImageAnalysis {
  id: string;
  medicalApprovalRequestId: string;
  timestamp: Date;
  numImages: number;
  context?: string;
  userResponse: string;
  detailedAnalysis: string;
  createdAt: Date;

  private constructor(data: {
    id?: string;
    medicalApprovalRequestId?: string;
    timestamp: Date;
    numImages: number;
    context?: string;
    userResponse: string;
    detailedAnalysis: string;
    createdAt?: Date;
  }) {
    this.id = data.id || '';
    this.medicalApprovalRequestId = data.medicalApprovalRequestId || '';
    this.timestamp = data.timestamp;
    this.numImages = data.numImages;
    this.context = data.context;
    this.userResponse = data.userResponse;
    this.detailedAnalysis = data.detailedAnalysis;
    this.createdAt = data.createdAt || new Date();
  }

  // Factory method for creating new image analysis
  static create(data: {
    timestamp: Date;
    numImages: number;
    context?: string;
    userResponse: string;
    detailedAnalysis: string;
  }): ImageAnalysis {
    return new ImageAnalysis(data);
  }

  // Factory method for reconstituting from persistence
  static reconstitute(data: {
    id: string;
    medicalApprovalRequestId: string;
    timestamp: Date;
    numImages: number;
    context?: string;
    userResponse: string;
    detailedAnalysis: string;
    createdAt: Date;
  }): ImageAnalysis {
    return new ImageAnalysis(data);
  }
}
