import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyTable1765307822413 implements MigrationInterface {
  name = 'AddCompanyTable1765307822413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create companies table
    await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "cnpj" character varying(14) NOT NULL,
                "email" character varying(255) NOT NULL,
                "tenant_id" character varying(255),
                "base_url" character varying(500),
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_companies_cnpj" UNIQUE ("cnpj"),
                CONSTRAINT "PK_companies" PRIMARY KEY ("id")
            )
        `);

    // Create indexes for companies table
    await queryRunner.query(
      `CREATE INDEX "idx_companies_tenant_id" ON "companies" ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_companies_active" ON "companies" ("active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_companies_cnpj" ON "companies" ("cnpj")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_companies_cnpj"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_companies_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_companies_tenant_id"`);

    // Drop companies table
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
  }
}
