import { MigrationInterface, QueryRunner } from "typeorm";

export class FixHealthcareClaimsFieldLengths1770226464887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Increase specialty from VARCHAR(10) to VARCHAR(200)
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "specialty" TYPE character varying(200)`);
        
        // Increase service_type from VARCHAR(10) to VARCHAR(100)
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "service_type" TYPE character varying(100)`);
        
        // Increase icd_code from VARCHAR(10) to VARCHAR(20) (for safety)
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "icd_code" TYPE character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to original sizes (with data truncation risk)
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "icd_code" TYPE character varying(10)`);
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "service_type" TYPE character varying(10)`);
        await queryRunner.query(`ALTER TABLE "healthcare_claims" ALTER COLUMN "specialty" TYPE character varying(10)`);
    }

}
