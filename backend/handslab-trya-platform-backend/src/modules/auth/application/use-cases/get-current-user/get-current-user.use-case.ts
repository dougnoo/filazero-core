import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../../users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from '../../../../users/domain/repositories/user-db.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { ProfileResponseDto } from './profile-response.dto';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  /**
   * Executa o use case e retorna a entidade User do Cognito (usado por guards)
   * Busca os dados do usuário no Cognito usando o access token
   */
  async execute(accessToken: string): Promise<User> {
    const user = await this.authRepository.getCurrentUser(accessToken);

    if (!user) {
      throw new Error('Usuário não encontrado no Cognito');
    }

    return user;
  }

  /**
   * Executa o use case e retorna DTO completo (usado por controllers)
   * Busca os dados detalhados do usuário no banco de dados PostgreSQL por Cognito ID
   */
  async executeDtoByCognitoId(cognitoId: string): Promise<ProfileResponseDto> {
    const dbUser = await this.userDbRepository.findByCognitoId(cognitoId);

    if (!dbUser) {
      throw new Error('Usuário não encontrado no banco de dados');
    }

    // Retornar DTO com campos opcionais (crm, specialty são undefined se não for doctor)
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      phone: dbUser.phone,
      active: dbUser.active,
      boardCode: dbUser.doctor?.boardCode,
      boardNumber: dbUser.doctor?.boardNumber ?? '',
      boardState: dbUser.doctor?.boardState ?? '',
      specialty: dbUser.doctor?.specialty,
      profilePictureUrl: dbUser.profilePictureUrl,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}
