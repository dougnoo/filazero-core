import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserLookupRepository } from '../../domain/repositories/user-lookup.repository.interface';
import { User } from '../../../../database/entities/user.entity';

@Injectable()
export class TypeOrmUserLookupRepository implements IUserLookupRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findIdByEmail(
    email: string,
  ): Promise<{ id: string; tenantId: string; role: string } | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'tenantId', 'type'],
    });

    if (!user || !user.tenantId) {
      return null;
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      role: user.type,
    };
  }
}
