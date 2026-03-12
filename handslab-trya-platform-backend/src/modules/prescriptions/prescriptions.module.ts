import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionEntity } from './infrastructure/entities/Prescription.entity';
import { MemedPrescriptorEntity } from './infrastructure/entities/MemedPrescriptor.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { DoctorEntity } from '../users/infrastructure/entities/doctor.entity';
import { PrescriptionsController } from './presentation/controllers/prescriptions.controller';
import { PrescriptorsController } from './presentation/controllers/prescriptors.controller';
import { CreatePrescriptionUseCase } from './application/use-cases/create-prescription.use-case';
import { SendPrescriptionUseCase } from './application/use-cases/send-prescription.use-case';
import { ListPrescriptionsUseCase } from './application/use-cases/list-prescriptions.use-case';
import { GetPrescriptionUseCase } from './application/use-cases/get-prescription.use-case';
import { SyncPrescriptorUseCase } from './application/use-cases/sync-prescriptor/sync-prescriptor.use-case';
import { GetPrescriptorTokenUseCase } from './application/use-cases/get-prescriptor-token.use-case';
import { TypeOrmPrescriptionRepository } from './infrastructure/repositories/typeorm-prescription.repository';
import { HttpMemedRepository } from './infrastructure/repositories/http-memed.repository';
import { MemedPrescriptorService } from './infrastructure/services/memed-prescriptor.service';
import { PrescriptionRepository } from './domain/repositories/prescription.repository';
import { MEMED_REPOSITORY_TOKEN } from './domain/repositories/memed.repository.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrescriptionEntity,
      MemedPrescriptorEntity,
      UserEntity,
      DoctorEntity,
    ]),
  ],
  controllers: [PrescriptionsController, PrescriptorsController],
  providers: [
    // Memed Repository
    {
      provide: MEMED_REPOSITORY_TOKEN,
      useClass: HttpMemedRepository,
    },

    // Prescriptor Service
    MemedPrescriptorService,

    // Prescription Use Cases
    CreatePrescriptionUseCase,
    SendPrescriptionUseCase,
    ListPrescriptionsUseCase,
    GetPrescriptionUseCase,

    // Prescriptor Use Cases
    SyncPrescriptorUseCase,
    GetPrescriptorTokenUseCase,

    // Repositories
    {
      provide: PrescriptionRepository,
      useClass: TypeOrmPrescriptionRepository,
    },
  ],
  exports: [
    MEMED_REPOSITORY_TOKEN,
    CreatePrescriptionUseCase,
    SendPrescriptionUseCase,
    ListPrescriptionsUseCase,
    GetPrescriptionUseCase,
    SyncPrescriptorUseCase,
    GetPrescriptorTokenUseCase,
    PrescriptionRepository,
  ],
})
export class PrescriptionsModule {}
