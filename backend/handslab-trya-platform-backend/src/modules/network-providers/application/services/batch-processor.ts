import { DataSource } from 'typeorm';
import { CsvNormalizerHelper } from '../../infrastructure/helpers/csv-normalizer.helper';
import { AddressHashHelper } from '../../infrastructure/helpers/address-hash.helper';
import { BatchOperationRepository } from '../../infrastructure/repositories/batch-operation.repository';

export interface BatchResult {
  locationsAdded: number;
  providersAdded: number;
  servicesAdded: number;
}

export class BatchProcessor {
  private operatorId?: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly batchRepository: BatchOperationRepository,
  ) {}

  setOperatorId(operatorId?: string): void {
    this.operatorId = operatorId;
  }

  async processBatch(rows: Record<string, string>[]): Promise<BatchResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { locationsMap, providersToUpsert, servicesToInsert } =
        this.normalizeBatchRows(rows, this.operatorId);

      const locationsAdded = await this.insertBatchLocations(
        locationsMap,
        queryRunner,
      );

      let providersAdded = 0;
      let servicesAdded = 0;

      if (providersToUpsert.length > 0) {
        const providerResults = await this.batchRepository.upsertProviders(
          providersToUpsert,
          queryRunner,
        );
        providersAdded = providerResults.newCount;

        if (servicesToInsert.length > 0) {
          await this.batchRepository.insertBatchServices(
            servicesToInsert,
            providerResults.idMap,
            queryRunner,
          );
          servicesAdded = servicesToInsert.length;
        }
      }

      await queryRunner.commitTransaction();
      return { locationsAdded, providersAdded, servicesAdded };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private normalizeBatchRows(rows: Record<string, string>[], operatorId?: string) {
    const locationsMap = new Map<string, any>();
    const providerMap = new Map<string, any>();
    const providersToUpsert: any[] = [];
    const servicesToInsert: any[] = [];

    rows.forEach((row) => {
      const normalized = CsvNormalizerHelper.normalize(row);
      const hash = AddressHashHelper.generate(
        normalized.postalCode,
        normalized.streetName,
        normalized.streetNumber || '',
        normalized.city,
        normalized.state,
      );

      locationsMap.set(hash, {
        hash,
        postal_code: normalized.postalCode,
        street_type: normalized.streetType,
        street_name: normalized.streetName,
        street_number: normalized.streetNumber,
        complement: normalized.complement,
        neighborhood: normalized.neighborhood,
        city: normalized.city,
        state: normalized.state,
        full_address: AddressHashHelper.formatFullAddress(normalized),
      });

      const providerKey = `${hash}|${normalized.name}`;
      if (!providerMap.has(providerKey)) {
        const provider = {
          location_hash: hash,
          name: normalized.name,
          operatorId,
          phone1AreaCode: normalized.phone1AreaCode,
          phone1: normalized.phone1,
          phone2AreaCode: normalized.phone2AreaCode,
          phone2: normalized.phone2,
          whatsappAreaCode: normalized.whatsappAreaCode,
          whatsapp: normalized.whatsapp,
          insuranceCompany: normalized.insuranceCompany,
          branchName: normalized.branchName,
          networkName: normalized.networkName,
          isActive: true,
        };
        providerMap.set(providerKey, provider);
        providersToUpsert.push(provider);
      }

      servicesToInsert.push({
        category: normalized.category,
        specialty: normalized.specialty,
        provider_key: providerKey,
      });
    });

    return { locationsMap, providersToUpsert, servicesToInsert };
  }

  private async insertBatchLocations(
    locationsMap: Map<string, any>,
    queryRunner: any,
  ): Promise<number> {
    const locationHashes = Array.from(locationsMap.keys());
    const existingHashes =
      await this.batchRepository.findExistingLocationHashes(locationHashes);
    const existingLocationHashes = new Set(existingHashes);

    const newLocations = Array.from(locationsMap.values()).filter(
      (loc) => !existingLocationHashes.has(loc.hash),
    );

    if (newLocations.length === 0) return 0;

    const locationsWithDefaults = newLocations.map((loc) => ({
      ...loc,
      geocoding_status: 'pending',
      geocoding_attempts: 0,
    }));

    return this.batchRepository.insertBatchLocations(
      locationsWithDefaults,
      queryRunner,
    );
  }

  private async upsertProviders(
    providers: any[],
    queryRunner: any,
  ): Promise<{ newCount: number; idMap: Map<string, number> }> {
    return this.batchRepository.upsertProviders(providers, queryRunner);
  }

  private async insertServices(
    services: any[],
    providerIdMap: Map<string, number>,
    queryRunner: any,
  ): Promise<void> {
    return this.batchRepository.insertBatchServices(
      services,
      providerIdMap,
      queryRunner,
    );
  }
}
