import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../../../database/entities/user.entity';
import { UserPlan } from '../../../../database/entities/user-plan.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';
import {
  IBeneficiaryDbRepository,
  CreateBeneficiaryDbData,
  UpdateBeneficiaryDbData,
} from '../../domain/repositories/beneficiary-db.repository.interface';
import {
  IHrRepository,
  UpdateHrData,
  HrDetailModel,
} from '../../domain/repositories/hr.repository.interface';
import {
  IBeneficiaryRepository,
  ListBeneficiariesFilters,
  BeneficiaryModel,
  PaginatedBeneficiaries,
  UpdateBeneficiaryData,
  BeneficiaryDetailModel,
} from '../../domain/repositories/beneficiary.repository.interface';
import {
  IEmployeeListRepository,
  EmployeeFilters,
  PaginatedEmployees,
} from '../../domain/repositories/employee-list.repository.interface';

@Injectable()
export class TypeOrmUserRepository
  implements
    IBeneficiaryDbRepository,
    IHrRepository,
    IBeneficiaryRepository,
    IEmployeeListRepository
{
  private readonly logger = new Logger(TypeOrmUserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {}

  async updateDb(id: string, data: UpdateBeneficiaryDbData): Promise<void> {
    const user = await this.userRepository.update(id, {
      cognitoId: data.cognitoId,
      email: data.email,
      phone: data.phone,
    });
  }

  // IBeneficiaryDbRepository methods
  async create(data: CreateBeneficiaryDbData): Promise<User> {
    try {
      const cleanCpf = data.cpf ? data.cpf.replace(/[^\d]/g, '') : undefined;

      const user = this.userRepository.create();
      user.cognitoId = data.cognitoId;
      user.email = data.email;
      user.name = data.name;
      user.cpf = cleanCpf;
      user.tenantId = data.tenantId;
      user.phone = data.phone;
      user.birthDate = data.birthDate;
      user.type = data.type as UserRole;
      user.gender = data.gender || null;
      user.memberId = data.memberId || null;
      user.dependentType = data.dependentType;
      user.subscriberId = data.subscriberId || null;
      user.createdBy = data.createdBy || null;

      const savedUser = await this.userRepository.save(user);

      if (data.planId) {
        const userPlan = this.userPlanRepository.create({
          userId: savedUser.id,
          planId: data.planId,
          cardNumber: '0000000000000000',
        });
        await this.userPlanRepository.save(userPlan);
      }

      const userWithRelations = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['tenant'],
      });

      this.logger.log(`Beneficiário salvo: ${savedUser.id}`);
      return userWithRelations!;
    } catch (error) {
      this.logger.error(`Erro ao salvar beneficiário: ${error}`);
      if (error instanceof Error && error.message.includes('duplicate key')) {
        if (error.message.includes('cpf')) throw new Error('CPF já cadastrado');
        if (error.message.includes('email'))
          throw new Error('Email já cadastrado');
      }
      throw new Error(
        `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    return (
      (await this.userRepository.findOne({ where: { cpf: cleanCpf } })) || null
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await this.userRepository.findOne({ where: { email } })) || null;
  }

  async findByCognitoId(cognitoId: string): Promise<User | null> {
    return (
      (await this.userRepository.findOne({ where: { cognitoId } })) || null
    );
  }

  async findById(id: string): Promise<User | null> {
    return (
      (await this.userRepository.findOne({
        where: { id },
        withDeleted: true,
      })) || null
    );
  }

  async findByIdWithDependents(id: string): Promise<User | null> {
    return (
      (await this.userRepository.findOne({
        where: { id },
        relations: ['dependents'],
        withDeleted: true,
      })) || null
    );
  }

  async findByMemberId(
    matricula: string,
    tenantId: string,
  ): Promise<User | null> {
    return (
      (await this.userRepository.findOne({
        where: { memberId: matricula, tenantId },
      })) || null
    );
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new Error('Usuário não encontrado');
    await this.userRepository.softDelete(id);
    this.logger.log(`Usuário ${id} desativado`);
  }

  async updatePlan(userId: string, planId: string): Promise<void> {
    const existingPlan = await this.userPlanRepository.findOne({
      where: { userId },
    });

    if (existingPlan) {
      existingPlan.planId = planId;
      await this.userPlanRepository.save(existingPlan);
      this.logger.log(`Plano do usuário ${userId} atualizado para ${planId}`);
    } else {
      const newPlan = this.userPlanRepository.create({
        userId,
        planId,
        cardNumber: '0000000000000000',
      });
      await this.userPlanRepository.save(newPlan);
      this.logger.log(`Novo plano criado para o usuário ${userId}`);
    }
  }

  // IHrRepository methods
  async findHrById(id: string): Promise<HrDetailModel | null> {
    const user = await this.userRepository.findOne({
      where: { id, type: UserRole.HR },
      withDeleted: true,
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf || null,
      birthDate: user.birthDate,
      email: user.email || null,
      phone: user.phone || null,
      tenantId: user.tenantId || null,
      cognitoId: user.cognitoId || null,
      updatedAt: user.updatedAt,
    };
  }

  async updateHr(id: string, data: UpdateHrData): Promise<HrDetailModel> {
    return this.updateUser(id, UserRole.HR, data) as Promise<HrDetailModel>;
  }

  // IBeneficiaryRepository methods
  async listBeneficiaries(
    filters: ListBeneficiariesFilters,
  ): Promise<PaginatedBeneficiaries> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.type in (:...type)', {
        type: [UserRole.BENEFICIARY, UserRole.DEPENDENT],
      });

    if (filters.tenantId) {
      qb.andWhere('user.tenant_id = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters.search) {
      const pattern = `%${this.sanitizeSearch(filters.search)}%`;
      qb.andWhere(
        '(unaccent(user.name) ILIKE unaccent(:pattern) OR user.cpf LIKE :pattern OR user.email ILIKE :pattern)',
        { pattern },
      );
    }

    if (filters.active !== undefined) {
      qb.andWhere(
        filters.active
          ? 'user.deleted_at IS NULL'
          : 'user.deleted_at IS NOT NULL',
      );
    }

    qb.orderBy('user.createdAt', 'DESC');

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const [users, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const subscriberIds = users
      .map((user) => user.subscriberId)
      .filter((id): id is string => Boolean(id));
    const subscribers = subscriberIds.length
      ? await this.userRepository.find({
          select: ['id', 'name'],
          where: { id: In(subscriberIds) },
          withDeleted: true,
        })
      : [];
    const subscriberNameById = new Map(
      subscribers.map((subscriber) => [subscriber.id, subscriber.name]),
    );

    return {
      data: users.map((u, index) => ({
        id: u.id,
        name: u.name,
        cpf: u.cpf || null,
        email: u.email || null,
        cognitoId: u.cognitoId || null,
        deletedAt: u.deletedAt || null,
        dependentType: u.dependentType || null,
        subscriberName: u.subscriberId
          ? subscriberNameById.get(u.subscriberId)
          : undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBeneficiaryById(
    id: string,
  ): Promise<BeneficiaryDetailModel | null> {
    const user = await this.userRepository.findOne({
      where: { id, type: In([UserRole.BENEFICIARY, UserRole.DEPENDENT]) },
      relations: ['tenant', 'dependents'],
      withDeleted: true,
    });

    if (!user) return null;

    const userPlan = await this.userPlanRepository.findOne({
      where: { userId: id },
      relations: ['plan', 'plan.operator'],
    });

    const dependents =
      !user.dependentType || user.dependentType === 'SELF'
        ? (user.dependents ?? []).map((dep) => ({
            id: dep.id,
            name: dep.name,
            cpf: dep.cpf || null,
            birthDate: dep.birthDate,
            email: dep.email || null,
            phone: dep.phone || null,
            deletedAt: dep.deletedAt || null,
            gender: dep.gender || null,
            memberId: dep.memberId || null,
            dependentType: dep.dependentType || DependentType.SELF,
          }))
        : null;

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf || null,
      birthDate: user.birthDate,
      email: user.email || null,
      phone: user.phone || null,
      tenantId: user.tenantId || null,
      tenantName: user.tenant?.name || null,
      cognitoId: user.cognitoId || null,
      planId: userPlan?.planId || null,
      planName: userPlan?.plan?.name || null,
      operatorName: userPlan?.plan?.operator?.name || null,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt || null,
      gender: user.gender || null,
      memberId: user.memberId || null,
      dependentType: user.dependentType || null,
      dependents: dependents,
    };
  }

  async updateBeneficiary(
    id: string,
    data: UpdateBeneficiaryData,
  ): Promise<BeneficiaryDetailModel> {
    // Buscar informações do beneficiário antes da atualização para verificar se é titular
    const beneficiary = await this.userRepository.findOne({
      where: { id },
      relations: ['dependents'],
    });

    const oldMemberId = beneficiary?.memberId;
    const isTitular = beneficiary?.dependentType === DependentType.SELF;

    const result = await this.updateUser(id, UserRole.BENEFICIARY, data);

    // Se a matrícula foi alterada e o beneficiário é titular, atualizar matrículas dos dependentes
    if (
      data.memberId !== undefined &&
      isTitular &&
      oldMemberId !== data.memberId &&
      beneficiary?.dependents &&
      beneficiary.dependents.length > 0
    ) {
      this.logger.log(
        `Atualizando matrículas de ${beneficiary.dependents.length} dependentes do titular ${id}`,
      );

      for (const dependent of beneficiary.dependents) {
        if (dependent.memberId) {
          // Extrai o sufixo da matrícula antiga (parte após o último hífen)
          const parts = dependent.memberId.split('-');
          const suffix = parts.length > 1 ? parts[parts.length - 1] : null;

          // Cria nova matrícula com a base do titular e o sufixo do dependente
          const newDependentMemberId = suffix
            ? `${data.memberId}-${suffix}`
            : data.memberId;

          await this.userRepository.update(dependent.id, {
            memberId: newDependentMemberId,
          });

          this.logger.log(
            `Matrícula do dependente ${dependent.id} atualizada de ${dependent.memberId} para ${newDependentMemberId}`,
          );
        }
      }
    }

    if (data.planId !== undefined) {
      const existingPlan = await this.userPlanRepository.findOne({
        where: { userId: id },
      });
      if (existingPlan) {
        existingPlan.planId = data.planId;
        await this.userPlanRepository.save(existingPlan);
      } else {
        const newPlan = this.userPlanRepository.create({
          userId: id,
          planId: data.planId,
          cardNumber: Math.random()
            .toString()
            .substring(2, 11)
            .padStart(9, '0'),
          activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        await this.userPlanRepository.save(newPlan);
      }
      result.planId = data.planId;
    }

    return result as BeneficiaryDetailModel;
  }

  // IEmployeeListRepository methods
  async findEmployees(filters: EmployeeFilters): Promise<PaginatedEmployees> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .withDeleted();

    if (filters.type) {
      qb.where('user.type = :type', { type: filters.type });
    } else {
      qb.where('user.type IN (:...types)', {
        types: [UserRole.HR, UserRole.BENEFICIARY],
      });
    }

    if (filters.tenantId) {
      qb.andWhere('user.tenant_id = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters.search) {
      const pattern = `%${this.sanitizeSearch(filters.search)}%`;
      qb.andWhere(
        '(unaccent(user.name) ILIKE unaccent(:pattern) OR user.cpf LIKE :pattern OR user.email ILIKE :pattern)',
        { pattern },
      );
    }

    if (filters.active !== undefined) {
      qb.andWhere(
        filters.active
          ? 'user.deleted_at IS NULL'
          : 'user.deleted_at IS NOT NULL',
      );
    }

    qb.orderBy('user.name', 'ASC');

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const [users, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        cpf: u.cpf || null,
        email: u.email || '',
        type: u.type,
        tenantName: u.tenant?.name || 'Sem empresa',
        active: !u.deletedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private sanitizeSearch(search: string): string {
    return search
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9@. ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async updateUser(
    id: string,
    type: UserRole,
    data: UpdateHrData | UpdateBeneficiaryData,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id, type: In([UserRole.BENEFICIARY, UserRole.DEPENDENT]) },
      withDeleted: true,
    });

    if (!user) throw new NotFoundException(`Usuário ${type} não encontrado`);

    if (data.cpf && data.cpf !== user.cpf) {
      const existing = await this.userRepository.findOne({
        where: { cpf: data.cpf },
        withDeleted: true,
      });
      if (existing) throw new ConflictException('CPF já cadastrado');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: data.email },
        withDeleted: true,
      });
      if (existing) throw new ConflictException('Email já cadastrado');
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.cpf !== undefined) user.cpf = data.cpf;
    if (data.birthDate !== undefined) user.birthDate = data.birthDate;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if ('tenantId' in data && data.tenantId !== undefined)
      user.tenantId = data.tenantId;
    if ('gender' in data && data.gender !== undefined)
      user.gender = data.gender;
    if ('memberId' in data && data.memberId !== undefined)
      user.memberId = data.memberId;
    if ('dependentType' in data && data.dependentType !== undefined)
      user.dependentType = data.dependentType as DependentType;

    const updated = await this.userRepository.save(user);

    const userPlan = await this.userPlanRepository.findOne({
      where: { userId: updated.id },
    });

    return {
      id: updated.id,
      name: updated.name,
      cpf: updated.cpf,
      birthDate: updated.birthDate,
      email: updated.email || null,
      phone: updated.phone || null,
      tenantId: updated.tenantId || null,
      cognitoId: updated.cognitoId || null,
      planId: userPlan?.planId || null,
      updatedAt: updated.updatedAt,
    };
  }
}
