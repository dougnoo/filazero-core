import { ApiProperty } from '@nestjs/swagger';

class PatientHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  chiefComplaint: string;

  @ApiProperty()
  createdAt: string;
}

export class GetPatientHistoryResponseDto {
  @ApiProperty({ type: [PatientHistoryItemDto] })
  history: PatientHistoryItemDto[];
}
