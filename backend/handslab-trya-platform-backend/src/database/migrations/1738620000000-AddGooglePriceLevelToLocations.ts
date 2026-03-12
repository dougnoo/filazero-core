import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGooglePriceLevelToLocations1738620000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'locations',
      new TableColumn({
        name: 'google_price_level',
        type: 'jsonb',
        isNullable: true,
        comment: 'Nível de preço estruturado: {level: number, label: string}',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('locations', 'google_price_level');
  }
}
