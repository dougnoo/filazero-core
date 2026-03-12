import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../database/entities/user.entity';
import {
  FamilyMembersResponseDto,
  FamilyMemberDto,
} from '../dto/document-response.dto';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';

export interface GetFamilyMembersInput {
  ownerUserId: string;
  tenantId: string;
}

const DEPENDENT_TYPE_LABELS: Record<DependentType, string> = {
  [DependentType.SELF]: 'Titular',
  [DependentType.SPOUSE]: 'Cônjuge',
  [DependentType.CHILD]: 'Filho(a)',
  [DependentType.STEPCHILD]: 'Enteado(a)',
};

@Injectable()
export class GetFamilyMembersUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(input: GetFamilyMembersInput): Promise<FamilyMembersResponseDto> {
    const { ownerUserId, tenantId } = input;

    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId, tenantId },
      relations: ['dependents'],
    });

    if (!owner) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const members: FamilyMemberDto[] = [];

    members.push({
      id: owner.id,
      name: owner.name,
      type: owner.dependentType ? DEPENDENT_TYPE_LABELS[owner.dependentType] || 'Titular' : 'Titular',
    });

    if (owner.dependents && owner.dependents.length > 0) {
      for (const dependent of owner.dependents) {
        members.push({
          id: dependent.id,
          name: dependent.name,
          type: dependent.dependentType 
            ? DEPENDENT_TYPE_LABELS[dependent.dependentType] || String(dependent.dependentType)
            : 'Dependente',
        });
      }
    }

    return { members };
  }
}
