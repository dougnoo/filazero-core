import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1762521467210 implements MigrationInterface {
  name = 'Initial1762521467210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."term_versions_type_enum" AS ENUM('TERMS_OF_USE', 'PRIVACY_POLICY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "term_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."term_versions_type_enum" NOT NULL, "version" character varying(20) NOT NULL, "s3Key" text NOT NULL, "s3Url" text, "isActive" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e64fd0288aef0ace82138fb5a49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_term_versions_type_active" ON "term_versions" ("type", "isActive") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_term_versions_type_version" ON "term_versions" ("type", "version") `,
    );
    await queryRunner.query(
      `CREATE TABLE "term_acceptances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "term_version_id" uuid NOT NULL, "ip_address" character varying(45), "accepted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1adadff38b5f6a70a9557e8c59a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_term_acceptances_user" ON "term_acceptances" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_term_acceptances_user_term" ON "term_acceptances" ("user_id", "term_version_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "term_acceptances" ADD CONSTRAINT "FK_term_acceptances_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "term_acceptances" ADD CONSTRAINT "FK_term_acceptances_term_version" FOREIGN KEY ("term_version_id") REFERENCES "term_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "term_acceptances" DROP CONSTRAINT "FK_term_acceptances_term_version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "term_acceptances" DROP CONSTRAINT "FK_term_acceptances_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_term_acceptances_user_term"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_term_acceptances_user"`);
    await queryRunner.query(`DROP TABLE "term_acceptances"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_term_versions_type_version"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_term_versions_type_active"`,
    );
    await queryRunner.query(`DROP TABLE "term_versions"`);
    await queryRunner.query(`DROP TYPE "public"."term_versions_type_enum"`);
  }
}
