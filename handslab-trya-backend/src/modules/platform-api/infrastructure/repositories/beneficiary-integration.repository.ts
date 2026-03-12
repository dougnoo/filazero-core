import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IBeneficiaryIntegrationRepository } from '../../domain/interfaces/beneficiary-integration.interface';
import { BeneficiaryDataDto } from '../../domain/dtos/beneficiary-data.dto';
import { User } from 'src/database/entities/user.entity';
import { UserPlan } from 'src/database/entities/user-plan.entity';
import { UserChronicCondition } from 'src/database/entities/user-chronic-condition.entity';
import { UserMedication } from 'src/database/entities/user-medication.entity';

@Injectable()
export class BeneficiaryIntegrationRepository
  implements IBeneficiaryIntegrationRepository
{
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(User)
    private readonly beneficiaryRepository: Repository<User>,
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
    @InjectRepository(UserChronicCondition)
    private readonly userChronicConditionRepository: Repository<UserChronicCondition>,
    @InjectRepository(UserMedication)
    private readonly userMedicationRepository: Repository<UserMedication>,
    private readonly configService: ConfigService,
  ) {
    const region = this.configService.get<string>('aws.region');
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.s3Client = new S3Client({
      region,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: { accessKeyId, secretAccessKey },
          }
        : {}),
    });

    this.bucketName = this.configService.get<string>(
      'aws.s3.bucketChatName',
      'trya-chat',
    );
  }

  async getBeneficiaryData(beneficiaryId: string): Promise<BeneficiaryDataDto> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: { id: beneficiaryId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    const userPlan = await this.userPlanRepository.findOne({
      where: { userId: beneficiaryId },
      relations: ['plan'],
    });

    const chronicConditions = await this.userChronicConditionRepository.find({
      where: { userId: beneficiaryId },
      relations: ['condition'],
    });

    const medications = await this.userMedicationRepository.find({
      where: { userId: beneficiaryId },
      relations: ['medication'],
    });

    return {
      id: beneficiary.id,
      name: beneficiary.name,
      email: beneficiary.email ?? null,
      cpf: beneficiary.cpf ?? null,
      birthDate: beneficiary.birthDate,
      phone: beneficiary.phone ?? null,
      allergies: beneficiary.allergies ?? null,
      healthPlan: userPlan?.plan
        ? {
            name: userPlan.plan.name,
            cardNumber: userPlan.cardNumber,
          }
        : null,
      chronicConditions: chronicConditions.map((cc) => ({
        name: cc.condition.name,
      })),
      medications: medications.map((m) => ({
        name: m.medication.name,
        dosage: m.dosage ?? null,
      })),
    };
  }

  async getBeneficiaryFile(
    fileId: string,
    beneficiaryId: string,
  ): Promise<{ url: string; fileName: string }> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: { id: beneficiaryId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `images/${fileId}`,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url,
      fileName: fileId,
    };
  }
}
