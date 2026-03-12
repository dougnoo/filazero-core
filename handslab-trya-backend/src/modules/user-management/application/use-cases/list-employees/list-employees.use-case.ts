import { Injectable, Inject, Logger } from '@nestjs/common';
import { ListEmployeesDto } from './list-employees.dto';
import { PaginatedListEmployeesResponseDto } from './paginated-list-employees-response.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import type { User as AuthUser } from '../../../../auth/domain/entities/user.entity';
import type { IEmployeeListRepository } from '../../../domain/repositories/employee-list.repository.interface';
import { EMPLOYEE_LIST_REPOSITORY_TOKEN } from '../../../domain/repositories/employee-list.repository.interface';

@Injectable()
export class ListEmployeesUseCase {
  private readonly logger = new Logger(ListEmployeesUseCase.name);

  constructor(
    @Inject(EMPLOYEE_LIST_REPOSITORY_TOKEN)
    private readonly employeeRepository: IEmployeeListRepository,
  ) {}

  async execute(
    dto: ListEmployeesDto,
    currentUser: AuthUser,
  ): Promise<PaginatedListEmployeesResponseDto> {
    this.logger.log(`Listando funcionários para usuário: ${currentUser.email}`);

    const tenantId = this.resolveTenantId(dto, currentUser);

    const result = await this.employeeRepository.findEmployees({
      tenantId,
      search: dto.search,
      active: dto.active,
      type: dto.type,
      page: dto.page,
      limit: dto.limit,
    });

    return result;
  }

  private resolveTenantId(
    dto: ListEmployeesDto,
    currentUser: AuthUser,
  ): string | undefined {
    if (currentUser.role === UserRole.HR) {
      return currentUser.tenantId;
    }
    return dto.tenantId;
  }
}
