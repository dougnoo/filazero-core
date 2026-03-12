import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  BeneficiaryImportRow,
  ImportResultDto,
} from '../../dtos/import-beneficiaries.dto';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import type { IFileParserService } from '../../../domain/services/file-parser.service.interface';
import type { IDateParserService } from '../../../domain/services/date-parser.service.interface';
import type { IPlanManagementService } from '../../../domain/services/plan-management.service.interface';
import {
  FILE_PARSER_SERVICE_TOKEN,
  DATE_PARSER_SERVICE_TOKEN,
  PLAN_MANAGEMENT_SERVICE_TOKEN,
  PLAN_VALIDATION_SERVICE_TOKEN,
} from '../../../domain/services/service.tokens';
import { MissingRequiredFieldsError } from '../../../domain/errors/missing-required-fields.error';
import { PlanNotFoundInPlatformError } from '../../../domain/errors/plan-not-found-in-platform.error';
import { DependentMissingTitularError } from '../../../domain/errors/dependent-missing-titular.error';
import { DuplicateTitularMemberIdError } from '../../../domain/errors/duplicate-titular-member-id.error';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';
import type { IPlanValidationService } from '../../../domain/services/plan-validation.service.interface';
import type { User as AuthUser } from '../../../../auth/domain/entities/user.entity';

@Injectable()
export class ImportBeneficiariesUseCase {
  private readonly logger = new Logger(ImportBeneficiariesUseCase.name);

  constructor(
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
    @Inject(FILE_PARSER_SERVICE_TOKEN)
    private readonly fileParser: IFileParserService,
    @Inject(DATE_PARSER_SERVICE_TOKEN)
    private readonly dateParser: IDateParserService,
    @Inject(PLAN_MANAGEMENT_SERVICE_TOKEN)
    private readonly planManagement: IPlanManagementService,
    @Inject(PLAN_VALIDATION_SERVICE_TOKEN)
    private readonly planValidation: IPlanValidationService,
  ) {}

  async execute(
    file: Express.Multer.File,
    currentUser: AuthUser,
  ): Promise<ImportResultDto> {
    const rows = this.fileParser.parseSpreadsheet<BeneficiaryImportRow>(file);
    const tenantId = currentUser.tenantId;
    const createdBy = currentUser.dbId || null;

    const result: ImportResultDto = {
      totalRows: rows.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdUserIds: [],
    };

    // Mapa para cache de titulares por matrícula
    const titularCache = new Map<string, string>();
    const titularMemberIdRows = new Map<string, number>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        this.validateRequiredFields(row, i + 2);

        // Valida se o plano existe na API da plataforma
        const planExists = await this.planValidation.validatePlanExists(
          row.Plano!,
        );
        if (!planExists) {
          const errorMsg = `Plano "${row.Plano}" não foi encontrado na plataforma, usuarios com esse plano não terão rede credenciada.`;
          this.logger.warn(errorMsg);
          result.errors.push({
            row: i + 2,
            data: row,
            error: errorMsg,
          });
        }

        const planId = await this.planManagement.getOrCreatePlan(row.Plano!);
        const dbUser = await this.saveOrUpdateBeneficiary(
          row,
          tenantId,
          planId,
          titularCache,
          titularMemberIdRows,
          i + 2,
          createdBy,
        );
        result.successCount++;
        result.createdUserIds.push(dbUser.id);
      } catch (error: any) {
        this.logger.error(
          `Error processing row ${i + 2}: ${error.message}`,
          error.stack,
        );
        result.errorCount++;
        result.errors.push({
          row: i + 2,
          data: row,
          error: error.message || 'Unknown error',
        });
      }
    }

    return result;
  }

  private validateRequiredFields(
    row: BeneficiaryImportRow,
    rowNumber: number,
  ): void {
    const errors: string[] = [];

    if (!row.Plano?.trim()) errors.push('Plano');
    if (!row.CPF?.trim()) errors.push('CPF');
    if (!row['Nome Beneficiário']?.trim()) errors.push('Nome Beneficiário');
    if (!row['Data Nascimento']) errors.push('Data Nascimento');

    if (errors.length > 0) {
      throw new MissingRequiredFieldsError(errors, rowNumber);
    }
  }

  private parseDependentType(tipo?: string): DependentType {
    if (!tipo) return DependentType.SELF;

    const tipoUpper = tipo.toUpperCase().trim();

    if (tipoUpper.includes('CONJUGE')) return DependentType.SPOUSE;
    if (tipoUpper.includes('FILHO') || tipoUpper.includes('FILHA'))
      return DependentType.CHILD;
    if (tipoUpper.includes('ENTEADO') || tipoUpper.includes('ENTEADA'))
      return DependentType.STEPCHILD;

    return DependentType.SELF;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private async saveOrUpdateBeneficiary(
    row: BeneficiaryImportRow,
    tenantId: string,
    planId: string,
    titularCache: Map<string, string>,
    titularMemberIdRows: Map<string, number>,
    rowNumber: number,
    createdBy: string | null,
  ) {
    const cleanCpf = row.CPF?.replace(/\D/g, '');
    const birthDate = this.dateParser.parseToDate(row['Data Nascimento']);
    const dependentType = this.parseDependentType(row.Tipo);
    const age = this.calculateAge(birthDate);

    // Verifica se o usuário já existe pelo CPF
    const existingUser = await this.beneficiaryDbRepository.findByCpf(cleanCpf);

    if (existingUser) {
      // Se o usuário já existe, apenas atualiza o plano
      await this.beneficiaryDbRepository.updatePlan(existingUser.id, planId);
      this.logger.log(`Beneficiário atualizado: ${existingUser.id}`);
      return existingUser;
    }

    let titularId: string | undefined;
    let memberId: string | undefined;

    if (row['Matrícula']) {
      this.logger.log('Matricula', row['Matrícula'])
      memberId = row['Matrícula'].toString().trim()
    }

    if (dependentType === DependentType.SELF && memberId) {
      if (titularMemberIdRows.has(memberId)) {
        throw new DuplicateTitularMemberIdError(rowNumber, memberId);
      }

      const existingByMemberId =
        await this.beneficiaryDbRepository.findByMemberId(memberId, tenantId);
      if (
        existingByMemberId &&
        (!existingByMemberId.dependentType ||
          existingByMemberId.dependentType === DependentType.SELF)
      ) {
        throw new DuplicateTitularMemberIdError(rowNumber, memberId);
      }

      titularMemberIdRows.set(memberId, rowNumber);
    }

    // Se é dependente, encontra o titular pela matrícula
    if (dependentType !== DependentType.SELF) {
      if (!memberId) {
        throw new DependentMissingTitularError(rowNumber, null);
      }

      // Verifica o cache primeiro
      if (titularCache.has(memberId)) {
        titularId = titularCache.get(memberId);
      } else {
        // Busca no banco de dados
        const titular = await this.beneficiaryDbRepository.findByMemberId(
          memberId,
          tenantId,
        );
        if (titular) {
          titularId = titular.id;
          titularCache.set(memberId, titular.id);
        }
      }

      if (!titularId) {
        throw new DependentMissingTitularError(rowNumber, memberId);
      }
    }

    // Para dependentes menores de 18 anos, não cria conta no Cognito
    const isMenor = age < 18;
    const cognitoId = isMenor ? null : null; // Para import, sempre null inicialmente

    // Se não existe, cria um novo
    const newUser = await this.beneficiaryDbRepository.create({
      cognitoId,
      email: null, // Dependentes não têm email inicialmente
      name: row['Nome Beneficiário']?.trim(),
      cpf: cleanCpf,
      tenantId,
      phone: null,
      birthDate,
      type:
        dependentType === DependentType.SELF
          ? UserRole.BENEFICIARY
          : UserRole.DEPENDENT,
      planId,
      memberId: memberId || null,
      dependentType,
      subscriberId: titularId,
      createdBy,
    });

    if (dependentType !== DependentType.SELF) {
      const tipoDescricao = this.getDependentTypeDescription(dependentType);
      if (isMenor) {
        this.logger.log(
          `Dependente menor de idade salvo apenas no DB: ${newUser.id} (${tipoDescricao}, ${age} anos)`,
        );
      } else {
        this.logger.log(`Dependente salvo: ${newUser.id} (${tipoDescricao})`);
      }
    }

    return newUser;
  }

  private getDependentTypeDescription(type: DependentType): string {
    const descriptions: Record<DependentType, string> = {
      [DependentType.SELF]: 'Titular',
      [DependentType.SPOUSE]: 'Cônjuge',
      [DependentType.CHILD]: 'Filho/Filha',
      [DependentType.STEPCHILD]: 'Enteado/Enteada',
    };
    return descriptions[type];
  }
}
