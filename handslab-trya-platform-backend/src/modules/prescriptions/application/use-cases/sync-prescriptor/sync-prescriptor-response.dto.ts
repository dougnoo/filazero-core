import { ApiProperty } from '@nestjs/swagger';
import { MemedStatus } from '../../../../../shared/domain/enums/memed-status.enum';

export class SyncPrescriptorResponseDto {
  @ApiProperty({
    description: 'Doctor user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  doctorId: string;

  @ApiProperty({
    description: 'Memed internal user ID',
    example: 12345,
  })
  memedId: number;

  @ApiProperty({
    description: 'Memed user token for prescriptions',
    example: 'abc123def456',
  })
  memedToken: string;

  @ApiProperty({
    description: 'Memed user status',
    enum: MemedStatus,
    example: MemedStatus.ACTIVE,
  })
  memedStatus: MemedStatus;

  @ApiProperty({
    description: 'Operation result message',
    example: 'Prescriptor created in Memed and synced successfully',
  })
  message: string;
}
