import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../database/entities/user.entity';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';
import { FamilySidebarResponseDto } from '../dto/family-sidebar-response.dto';

export interface GetFamilySidebarInput {
  ownerUserId: string;
}

@Injectable()
export class GetFamilySidebarUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(input: GetFamilySidebarInput): Promise<FamilySidebarResponseDto> {
    const { ownerUserId } = input;

    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId },
      relations: ['dependents'],
    });

    if (!owner) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const members = [
      {
        id: owner.id,
        name: owner.name,
        relationship: 'Eu',
        age: this.calculateAge(owner.birthDate),
      },
      ...(owner.dependents?.map((dependent) => ({
        id: dependent.id,
        name: dependent.name,
        relationship: this.mapDependentType(dependent.dependentType),
        age: this.calculateAge(dependent.birthDate),
      })) || []),
    ];

    return {
      totalMembers: members.length,
      members,
    };
  }

  private mapDependentType(dependentType?: DependentType | null): string {
    if (!dependentType || dependentType === DependentType.SELF) {
      return 'Titular';
    }

    const labels: Record<DependentType, string> = {
      [DependentType.SELF]: 'Titular',
      [DependentType.SPOUSE]: 'Cônjuge',
      [DependentType.CHILD]: 'Filho(a)',
      [DependentType.STEPCHILD]: 'Enteado(a)',
    };

    return labels[dependentType] || dependentType;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}
