import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string): Promise<void> {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundError();
    }

    // Deletar o usuário
    await this.userRepository.deleteUser(email);
  }
}
