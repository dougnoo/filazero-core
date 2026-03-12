import { Injectable, Inject } from '@nestjs/common';
import { UpdateUserDto } from './update-user.dto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string, updateUserDto: UpdateUserDto) {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundError();
    }

    // Atualizar o usuário
    const updatedUser = await this.userRepository.updateUser(
      email,
      updateUserDto,
    );

    // Se a role foi alterada, atualizar no Cognito
    if (updateUserDto.role && updateUserDto.role !== existingUser.role) {
      // Remover role antiga
      await this.userRepository.removeRole(email, existingUser.role);
      // Adicionar nova role
      await this.userRepository.assignRole(email, updateUserDto.role);
    }

    return updatedUser;
  }
}
