import { Injectable, Inject } from '@nestjs/common';
import { ZELO_REPOSITORY_TOKEN } from '../../domain/repositories/zelo.repository.token';
import type { IZeloRepository } from '../../domain/repositories/zelo.repository.interface';
import { CreatePatientDto } from '../dto';
import { ZeloPatient } from '../../domain/ZeloPatient.entity';

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async execute(dto: CreatePatientDto): Promise<ZeloPatient> {
    // Validar dados do domínio
    const patient = new ZeloPatient({
      name: dto.name,
      cpf: dto.cpf,
      email: dto.email,
      birthDate: dto.birth_date,
      phone: dto.phone,
      insuranceCardNumber: dto.insurance_card_number,
      insurancePlanCode: dto.insurance_plan_code,
      planAdherenceDate: dto.plan_adherence_date,
      planExpiryDate: dto.plan_expiry_date,
      extraFields: dto.extra_fields,
      address: dto.address
        ? {
            street: dto.address.street,
            number: dto.address.number,
            neighborhood: dto.address.neighborhood,
            city: dto.address.city,
            state: dto.address.state,
            zipCode: dto.address.zip_code,
          }
        : undefined,
    });

    // Validar campos obrigatórios
    patient.validate();

    // Validar formato do CPF
    if (!patient.isValidCpf()) {
      throw new Error('Invalid CPF format');
    }

    // Criar paciente via repository
    return await this.zeloRepository.createPatient(patient);
  }
}
