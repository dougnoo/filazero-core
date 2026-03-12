import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import {
  Prescription,
  SentVia,
} from '../../domain/entities/Prescription.entity';
import { MEMED_REPOSITORY_TOKEN } from '../../domain/repositories/memed.repository.token';
import type {
  IMemedRepository,
  MemedCredentials,
} from '../../domain/repositories/memed.repository.interface';
import { SendPrescriptionDto } from '../dtos/send-prescription.dto';
import { MemedPrescriptorService } from '../../infrastructure/services/memed-prescriptor.service';

@Injectable()
export class SendPrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    @Inject(MEMED_REPOSITORY_TOKEN)
    private readonly memedRepository: IMemedRepository,
    private readonly memedPrescriptorService: MemedPrescriptorService,
  ) {}

  async execute(
    prescriptionId: string,
    sendData: SendPrescriptionDto,
    credentials: MemedCredentials,
  ): Promise<Prescription> {
    // Find prescription
    const prescription =
      await this.prescriptionRepository.findById(prescriptionId);

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${prescriptionId} not found`,
      );
    }

    // Send via Memed
    const memedSendData: any = {};

    if (sendData.sendVia.includes('email' as any) && sendData.email) {
      memedSendData.email = sendData.email;
    }

    if (
      (sendData.sendVia.includes('sms' as any) ||
        sendData.sendVia.includes('whatsapp' as any)) &&
      sendData.phone
    ) {
      memedSendData.sms = sendData.phone;
      memedSendData.whatsapp = sendData.phone;
    }

    // Get doctor's memed token
    const memedToken = await this.memedPrescriptorService.getMemedToken(
      prescription.doctorId,
      credentials,
    );

    if (!memedToken) {
      throw new NotFoundException(
        `Memed token not found for doctor ${prescription.doctorId}. Please sync the prescriptor first.`,
      );
    }

    await this.memedRepository.sendPrescription(
      memedToken,
      memedSendData,
      credentials,
    );

    // Update prescription
    prescription.markAsSent(sendData.sendVia as SentVia[]);

    // Save to database
    return await this.prescriptionRepository.update(prescription);
  }
}
