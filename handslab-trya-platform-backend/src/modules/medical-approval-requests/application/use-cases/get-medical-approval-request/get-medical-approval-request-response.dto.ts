import { ApiProperty } from '@nestjs/swagger';

class ImageAnalysisDto {
  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  analysis: string;
}

class AttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  s3Key: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  fileType: string;
}

export class GetMedicalApprovalRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  chiefComplaint: string;

  @ApiProperty()
  conversationSummary: string;

  @ApiProperty()
  careRecommendation: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  urgencyLevel: string;

  @ApiProperty({ required: false })
  doctorNotes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  assignedDoctorId?: string;

  @ApiProperty({ type: [String] })
  careInstructions: string[];

  @ApiProperty({ type: [ImageAnalysisDto] })
  imageAnalyses: ImageAnalysisDto[];

  @ApiProperty({ type: [String] })
  suggestedExams: string[];

  @ApiProperty({ type: [String] })
  symptoms: string[];

  @ApiProperty({ type: [AttachmentDto] })
  attachments: AttachmentDto[];
}
