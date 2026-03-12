import { Inject, Injectable } from '@nestjs/common';
import { GetUserInfoResponseDto } from './get-user-info-response.dto';
import type { IUserDetailRepository } from '../../../../user-management/domain/repositories/user-detail.repository.interface';
import { USER_DETAIL_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/user-detail.repository.interface';

@Injectable()
export class GetUserInfoByIdUseCase {
  constructor(
    @Inject(USER_DETAIL_REPOSITORY_TOKEN)
    private readonly userDetailRepository: IUserDetailRepository,
  ) {}

  /**
   * Executa o use case e retorna DTO por ID (usado por controllers)
   */
  async execute(userId: string): Promise<GetUserInfoResponseDto> {
    const userDetail =
      await this.userDetailRepository.findUserDetailById(userId);

    if (!userDetail) {
      throw new Error('Usuário não encontrado');
    }

    return userDetail;
  }
}
