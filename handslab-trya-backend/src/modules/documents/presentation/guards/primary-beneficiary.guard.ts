import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../database/entities/user.entity';

@Injectable()
export class PrimaryBeneficiaryGuard implements CanActivate {
  private readonly logger = new Logger(PrimaryBeneficiaryGuard.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;

    if (!currentUser?.dbId) {
      this.logger.warn('Usuário não autenticado tentou acessar documentos');
      throw new ForbiddenException('Acesso negado');
    }

    const user = await this.userRepository.findOne({
      where: { id: currentUser.dbId },
      select: ['id', 'subscriberId', 'dependentType'],
    });

    if (!user) {
      this.logger.warn(
        `Usuário ${currentUser.dbId} não encontrado no banco de dados`,
      );
      throw new ForbiddenException('Acesso negado');
    }

    if (user.subscriberId !== null) {
      this.logger.warn(
        `Dependente ${user.id} tentou acessar o módulo de documentos`,
      );
      throw new ForbiddenException(
        'Acesso restrito ao beneficiário principal. Dependentes não podem acessar o repositório de documentos.',
      );
    }

    return true;
  }
}
