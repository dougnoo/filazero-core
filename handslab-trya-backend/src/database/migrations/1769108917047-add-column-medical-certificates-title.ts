import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnMedicalCertificatesTitle1769108917047 implements MigrationInterface {
    name = 'AddColumnMedicalCertificatesTitle1769108917047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('medical_certificates');
        const column = table?.findColumnByName('title');

        if (!column) {
            await queryRunner.addColumn(
                'medical_certificates',
                new TableColumn({
                    name: 'title',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.dropColumn('medical_certificates', 'title');
    }

}
