import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { LocationEntity } from '../entities/location.entity';
import { ProviderEntity } from '../entities/provider.entity';
import { ServiceEntity } from '../entities/service.entity';

@Injectable()
export class BatchOperationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findExistingLocationHashes(hashes: string[]): Promise<string[]> {
    if (hashes.length === 0) return [];

    const locations = await this.locationRepository.find({
      where: { hash: In(hashes) },
      select: { hash: true },
    });
    return locations.map((loc) => loc.hash);
  }

  async insertBatchLocations(
    locations: any[],
    queryRunner: any,
  ): Promise<number> {
    if (locations.length === 0) return 0;

    const schema = process.env.DB_SCHEMA;

    // Colunas que realmente vêm dos dados
    const columns = [
      'hash',
      'postal_code',
      'street_type',
      'street_name',
      'street_number',
      'complement',
      'neighborhood',
      'city',
      'state',
      'full_address',
    ];

    const placeholders = locations
      .map((_, i) => {
        const offset = i * columns.length;
        return `(${columns.map((_, j) => `$${offset + j + 1}`).join(', ')})`;
      })
      .join(', ');

    const values = locations.flatMap((loc) =>
      columns.map((col) => {
        if (col === 'postal_code') {
          return loc['postal_code']?.trim() || '00000000';
        }
        if (col === 'street_type') {
          return loc['street_type'] || null;
        }
        if (col === 'street_name') {
          // street_name é obrigatório, usar full_address se vazio
          return (
            loc['street_name']?.trim() ||
            loc['full_address']?.substring(0, 255) ||
            'Sem dados'
          );
        }
        if (col === 'street_number') {
          return loc['street_number']?.trim() || null;
        }
        return loc[col] || null;
      }),
    );

    await queryRunner.query(
      `INSERT INTO "${schema}"."locations" (${columns.map((c) => `"${c}"`).join(', ')})
       VALUES ${placeholders}`,
      values,
    );

    return locations.length;
  }

  async upsertProviders(
    providers: any[],
    queryRunner: any,
  ): Promise<{ newCount: number; idMap: Map<string, number> }> {
    if (providers.length === 0) return { newCount: 0, idMap: new Map() };

    const schema = process.env.DB_SCHEMA;

    // Colunas manualmente definidas baseado na entidade ProviderEntity
    const columns = [
      'operator_id',
      'location_hash',
      'name',
      'phone1_area_code',
      'phone1',
      'phone2_area_code',
      'phone2',
      'whatsapp_area_code',
      'whatsapp',
      'insurance_company',
      'branch_name',
      'network_name',
      'is_active',
    ];

    const placeholders = providers
      .map((_, i) => {
        const offset = i * columns.length;
        return `(${columns.map((_, j) => `$${offset + j + 1}`).join(', ')})`;
      })
      .join(', ');

    const values = providers.flatMap((p) =>
      columns.map((col) => {
        // Mapeamento direto snake_case → camelCase
        const mappings: Record<string, string> = {
          operator_id: 'operatorId',
          location_hash: 'location_hash',
          name: 'name',
          phone1_area_code: 'phone1AreaCode',
          phone1: 'phone1',
          phone2_area_code: 'phone2AreaCode',
          phone2: 'phone2',
          whatsapp_area_code: 'whatsappAreaCode',
          whatsapp: 'whatsapp',
          insurance_company: 'insuranceCompany',
          branch_name: 'branchName',
          network_name: 'networkName',
          is_active: 'isActive',
        };

        const propName = mappings[col] || col;
        return p[propName] !== undefined ? p[propName] : null;
      }),
    );

    const result = await queryRunner.query(
      `INSERT INTO "${schema}"."providers" (${columns.map((c) => `"${c}"`).join(', ')})
       VALUES ${placeholders}
       ON CONFLICT ("name", "location_hash", "operator_id") DO UPDATE SET
         phone1_area_code = EXCLUDED.phone1_area_code,
         phone1 = EXCLUDED.phone1,
         phone2_area_code = EXCLUDED.phone2_area_code,
         phone2 = EXCLUDED.phone2,
         whatsapp_area_code = EXCLUDED.whatsapp_area_code,
         whatsapp = EXCLUDED.whatsapp,
         insurance_company = EXCLUDED.insurance_company,
         branch_name = EXCLUDED.branch_name,
         network_name = EXCLUDED.network_name,
         is_active = EXCLUDED.is_active,
         updated_at = NOW()
       WHERE "${schema}"."providers".is_active != EXCLUDED.is_active OR 
             "${schema}"."providers".phone1 != EXCLUDED.phone1
       RETURNING id, location_hash, name`,
      values,
    );

    const idMap = new Map<string, number>();
    result.forEach((row: any) => {
      idMap.set(`${row.location_hash}|${row.name}`, row.id);
    });

    const checkNewCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "${schema}"."providers" WHERE created_at > NOW() - INTERVAL '1 minute'`,
    );
    const newCount = parseInt(checkNewCount[0].count, 10);

    return { newCount, idMap };
  }

  async insertBatchServices(
    services: any[],
    providerIdMap: Map<string, number>,
    queryRunner: any,
  ): Promise<void> {
    if (services.length === 0) return;

    const schema = process.env.DB_SCHEMA;
    const servicesToInsert = services
      .map((service) => ({
        provider_id: providerIdMap.get(service.provider_key),
        category: service.category,
        specialty: service.specialty,
      }))
      .filter((s) => s.provider_id !== undefined && s.provider_id !== null);

    if (servicesToInsert.length === 0) return;

    const columns = ['provider_id', 'category', 'specialty'];
    const placeholders = servicesToInsert
      .map((_, i) => {
        const offset = i * columns.length;
        return `(${columns.map((_, j) => `$${offset + j + 1}`).join(', ')})`;
      })
      .join(', ');

    const values = servicesToInsert.flatMap((s) =>
      columns.map((col) => s[col as keyof typeof s]),
    );

    await queryRunner.query(
      `INSERT INTO "${schema}"."services" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES ${placeholders}`,
      values,
    );
  }

  async clearServices(): Promise<void> {
    await this.serviceRepository.createQueryBuilder().delete().execute();
  }

  async clearProviders(): Promise<void> {
    await this.providerRepository.createQueryBuilder().delete().execute();
  }

  async clearServicesByOperator(operatorId: string): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';
    // Delete services that belong to providers of this operator
    await this.dataSource.query(
      `DELETE FROM "${schema}"."services" 
       WHERE provider_id IN (
         SELECT id FROM "${schema}"."providers" WHERE operator_id = $1
       )`,
      [operatorId],
    );
  }

  async clearProvidersByOperator(operatorId: string): Promise<void> {
    await this.providerRepository
      .createQueryBuilder()
      .delete()
      .where('operator_id = :operatorId', { operatorId })
      .execute();
  }

  async deleteOrphanLocations(): Promise<void> {
    const orphanLocations = await this.locationRepository.find({
      where: {
        geocodingStatus: 'pending',
      },
    });

    const providersLocations = await this.providerRepository.find({
      select: { locationHash: true },
    });

    const providerHashes = new Set(
      providersLocations.map((p) => p.locationHash),
    );

    const locationsToDelete = orphanLocations.filter(
      (loc) => !providerHashes.has(loc.hash),
    );

    if (locationsToDelete.length > 0) {
      await this.locationRepository.remove(locationsToDelete);
    }
  }
}
