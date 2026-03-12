import { Injectable } from '@nestjs/common';
import {
  IChronicConditionsRepository,
  ListChronicConditionsParams,
} from '../../domain/repositories/chronic-conditions.repository';

@Injectable()
export class ListChronicConditionsUseCase {
  constructor(private readonly repo: IChronicConditionsRepository) {}

  async execute(params: ListChronicConditionsParams) {
    return this.repo.list(params);
  }
}
