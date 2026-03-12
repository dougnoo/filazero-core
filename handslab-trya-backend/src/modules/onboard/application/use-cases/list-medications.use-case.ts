import { Injectable } from '@nestjs/common';
import {
  IMedicationsRepository,
  ListMedicationsParams,
} from '../../domain/repositories/medications.repository';

@Injectable()
export class ListMedicationsUseCase {
  constructor(private readonly repo: IMedicationsRepository) {}

  async execute(params: ListMedicationsParams) {
    return this.repo.list(params);
  }
}
