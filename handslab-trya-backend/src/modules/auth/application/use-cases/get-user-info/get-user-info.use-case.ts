import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { User } from '../../../domain/entities/user.entity';
import { GetUserInfoResponseDto } from './get-user-info-response.dto';
import type { IUserDetailRepository } from '../../../../user-management/domain/repositories/user-detail.repository.interface';
import { USER_DETAIL_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/user-detail.repository.interface';
import type { IBeneficiaryDbRepository } from '../../../../user-management/domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/beneficiary-db.repository.token';

@Injectable()
export class GetUserInfoUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(USER_DETAIL_REPOSITORY_TOKEN)
    private readonly userDetailRepository: IUserDetailRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IBeneficiaryDbRepository,
  ) {}

  /**
   * Executa o use case e retorna a entidade User (usado por guards)
   * Enriquece tenantId do PostgreSQL quando Cognito não tem custom:tenant_id
   */
  async execute(accessToken: string): Promise<User> {
    const user = await this.authRepository.getUserInfo(accessToken);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Sempre buscar do PostgreSQL para obter dbId e tenantId corretos
    // Busca por cognito_id (sub do Cognito), não pelo id da tabela users
    const dbUser = await this.userDbRepository.findByCognitoId(user.id);

    if (dbUser) {
      console.log('[GetUserInfoUseCase] Dados PostgreSQL:', {
        dbId: dbUser.id,
        tenantId: dbUser.tenantId,
      });
      // Criar novo objeto User com tenantId e dbId do banco
      return new User(
        user.id,
        user.email,
        user.name,
        user.role,
        dbUser.tenantId || user.tenantId,
        user.isEmailVerified,
        user.createdAt,
        user.updatedAt,
        user.lastLogin,
        dbUser.id, // dbId do PostgreSQL
      );
    } else {
      console.warn(
        '[GetUserInfoUseCase] Usuário não encontrado no PostgreSQL para cognito_id:',
        user.id,
      );
    }

    return user;
  }

  /**
   * Executa o use case e retorna DTO (usado por controllers)
   */
  async executeDto(email: string): Promise<GetUserInfoResponseDto> {
    const userDetail =
      await this.userDetailRepository.findUserDetailByEmail(email);

    if (!userDetail) {
      throw new Error('Usuário não encontrado');
    }

    return userDetail;
  }
}
