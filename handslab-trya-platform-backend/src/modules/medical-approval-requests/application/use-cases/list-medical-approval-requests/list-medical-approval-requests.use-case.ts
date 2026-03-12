import { Injectable, Inject } from '@nestjs/common';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import { ListMedicalApprovalRequestsDto } from './list-medical-approval-requests.dto';
import { ListMedicalApprovalRequestsResponseDto } from './list-medical-approval-requests-response.dto';
import { ListMedicalApprovalRequestsMapper } from './list-medical-approval-requests.mapper';
import { OrderBy } from '../../../domain/enums/order-by.enum';
import { OrderDirection } from '../../../domain/enums/order-direction.enum';

@Injectable()
export class ListMedicalApprovalRequestsUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly repository: IMedicalApprovalRequestRepository,
  ) {}

  async execute(
    dto: ListMedicalApprovalRequestsDto,
  ): Promise<ListMedicalApprovalRequestsResponseDto> {
    const filters = {
      status: dto.status,
      urgencyLevel: dto.urgencyLevel,
      patientName: dto.patientName,
      date: dto.date,
      orderBy: dto.orderBy ?? OrderBy.URGENCY_AND_TIME,
      orderDirection: dto.orderDirection ?? OrderDirection.DESC,
    };

    const pagination = {
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
    };

    const result = await this.repository.findAll(filters, pagination);

    const data = result.data.map((request) =>
      ListMedicalApprovalRequestsMapper.toResponseDto(request),
    );

    return {
      data,
      pagination: result.pagination,
    };
  }
}
