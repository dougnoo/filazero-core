import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHealthcareClaims1770224911717 implements MigrationInterface {
    name = 'AddHealthcareClaims1770224911717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = process.env.DB_SCHEMA || 'public';
        await queryRunner.query(`SET search_path TO "${schema}", "public"`);
        
        // Drop constraints with existence check using PostgreSQL's IF EXISTS syntax
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT IF EXISTS "FK_doctors_user_id"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT IF EXISTS "FK_prescriptions_doctor_id"`);
        await queryRunner.query(`ALTER TABLE "memed_prescriptors" DROP CONSTRAINT IF EXISTS "FK_memed_prescriptors_user_id"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT IF EXISTS "fk_providers_location"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "fk_services_provider"`);
        await queryRunner.query(`ALTER TABLE "image_analyses" DROP CONSTRAINT IF EXISTS "FK_image_analyses_medical_approval_request"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT IF EXISTS "FK_attachments_medical_approval_request"`);
        await queryRunner.query(`ALTER TABLE "suggested_exams" DROP CONSTRAINT IF EXISTS "FK_suggested_exams_medical_approval_request"`);
        await queryRunner.query(`ALTER TABLE "care_instructions" DROP CONSTRAINT IF EXISTS "FK_care_instructions_medical_approval_request"`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" DROP CONSTRAINT IF EXISTS "FK_medical_approval_requests_assigned_doctor"`);
        await queryRunner.query(`ALTER TABLE "symptoms" DROP CONSTRAINT IF EXISTS "FK_symptoms_medical_approval_request"`);
        const dropIndexes = [
            'IDX_doctors_user_id',
            'idx_doctors_board_info',
            'IDX_users_cognito_id',
            'idx_users_cpf',
            'idx_prescriptions_tenant_id',
            'idx_prescriptions_doctor_id',
            'idx_prescriptions_patient_id',
            'idx_prescriptions_session_id',
            'idx_prescriptions_memed_prescription_id',
            'idx_memed_prescriptors_user_id',
            'idx_memed_prescriptors_memed_id',
            'idx_memed_prescriptors_memed_external_id',
            'idx_locations_postal_code',
            'idx_locations_city',
            'idx_locations_state',
            'idx_locations_latitude',
            'idx_locations_longitude',
            'idx_locations_geocoding_status',
            'idx_locations_geocoding_attempts',
            'idx_locations_google_place_id',
            'idx_locations_google_rating',
            'idx_providers_location_hash',
            'idx_providers_name',
            'idx_providers_insurance_company',
            'idx_providers_is_active',
            'idx_providers_name_location',
            'idx_services_provider_id',
            'idx_services_category',
            'idx_imports_status',
            'idx_imports_started_at',
            'idx_imports_operator_id',
            'idx_suggested_exams_request',
            'idx_care_instructions_request',
            'idx_symptoms_request',
            'idx_companies_tenant_id',
            'idx_companies_active',
            'idx_companies_cnpj',
            // Additional indexes from second list
            'idx_company_cnpj',
            'idx_company_active',
            'idx_company_tenant_id',
            'IDX_9d68056018d5e3fca40d6b11e2',
            'IDX_d371c5c5522c7e62f84600e4cd',
            'IDX_0eff1efc3c8e7eb148ce62597b',
            'IDX_cfdcce31c9c571f9e5a8226dec',
            'IDX_e7a40b21f8fd548be206fcc89b',
            'IDX_323f93843bab3674d050ee2d64',
            'IDX_816b7c517bea7240587a228db7',
            'IDX_907334e8cae69a99734e4a9910',
            'IDX_d735474e539e674ba3702eddc4',
            'IDX_bc7c6adc17252226ed5f3ccb95',
            'IDX_8cc85028d44ae1c598215b1643',
            'IDX_4ce3e3a12a5e07fe82d42d8738',
            'IDX_501e65a3fc81f4438047b7bfc8',
            'IDX_cb382e92f641c2776311fdde8f',
            'IDX_48db887c8226495cba27db51f6',
            'IDX_c39c0d01058a6cd46054fd1af0',
            'IDX_a0d755857c70341a60b7054770',
            'IDX_8d86e811a6eeb8a467fdbb0152',
            'IDX_f1a9093eafe4afa3a5ee8ca096',
            'IDX_87e9967c596f5008b8a3f54a54',
            'IDX_7cd52f47e5be999fa3dd8609e7',
            'IDX_3d8dcae2b7abd337a46c6bc5e0',
            'IDX_a437808c05488340de653aa19b',
            'IDX_976d656e9de5a32f99a1fe6414',
            'IDX_9389db557647131856661f7d7b',
            'IDX_2d6a1941bd705056030c2b9e07',
            'IDX_416055516c115bc14cf34f012d',
            'IDX_4e97d9cc32d58808894cfb86b7',
            'IDX_d9dea74916617da4a95c8cce52',
            'IDX_653c27d1b10652eb0c7bbbc442',
        ];

        for (const indexName of dropIndexes) {
            await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."${indexName}"`);
        }
        await queryRunner.query(`CREATE TABLE "provider_name_mappings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "raw_name" character varying(500) NOT NULL, "normalized_name" character varying(500) NOT NULL, "provider_id" uuid, "confidence" numeric(5,2) NOT NULL DEFAULT '100', "is_manual" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_abf3da535fcae62c49b5d574792" UNIQUE ("raw_name"), CONSTRAINT "PK_d7781790f1abfb5483e463b2dcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abf3da535fcae62c49b5d57479" ON "provider_name_mappings" ("raw_name") `);
        await queryRunner.query(`CREATE TABLE "provider_metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "total_claims" integer NOT NULL DEFAULT '0', "total_claim_value" numeric(15,2) NOT NULL DEFAULT '0', "avg_claim_value" numeric(15,2) NOT NULL DEFAULT '0', "specialty_counts" jsonb NOT NULL DEFAULT '{}', "top_procedures" jsonb NOT NULL DEFAULT '[]', "service_type_distribution" jsonb NOT NULL DEFAULT '{}', "last_claim_date" date, "first_claim_date" date, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5dd39d8349372ad4631d482df68" UNIQUE ("provider_id"), CONSTRAINT "REL_5dd39d8349372ad4631d482df6" UNIQUE ("provider_id"), CONSTRAINT "PK_9adbd6d0b49bc0f16aa4e9ee128" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5dd39d8349372ad4631d482df6" ON "provider_metrics" ("provider_id") `);
        await queryRunner.query(`CREATE TABLE "healthcare_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "operator_id" uuid, "provider_id" uuid, "provider_name_raw" character varying(500) NOT NULL, "matching_confidence" numeric(5,2), "user_code" character varying(50), "user_name_hash" character varying(64), "birth_date" date, "gender" character varying(20), "procedure_code" character varying(50) NOT NULL, "procedure_description" text, "specialty" character varying(200) NOT NULL, "service_type" character varying(10) NOT NULL, "icd_code" character varying(10), "icd_description" text, "claim_value" numeric(15,4) NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '1', "service_date" date NOT NULL, "city" character varying(100) NOT NULL, "state" character varying(2) NOT NULL, "provider_type" character varying(100), "import_batch_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a037ad27246aba38fd8fc020cb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9a64bae6108f0d4f5282de6c91" ON "healthcare_claims" ("service_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_10440aae893ac3408f13b3e757" ON "healthcare_claims" ("service_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_1da31b4874b72e4e84287c0904" ON "healthcare_claims" ("procedure_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_26f3619a9819fc321774ec03de" ON "healthcare_claims" ("city") `);
        await queryRunner.query(`CREATE INDEX "IDX_3dddd80d12eeb09512ebd1ceeb" ON "healthcare_claims" ("specialty") `);
        await queryRunner.query(`CREATE INDEX "IDX_59ccf2656dc6549f1da0053d20" ON "healthcare_claims" ("operator_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_93ee75e2c434d6394a837480c1" ON "healthcare_claims" ("provider_id") `);
        await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."profile_picture_url" IS NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_place_id" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_rating" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_user_ratings_total" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_weekday_text" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_place_url" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_last_fetched_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "imports" ALTER COLUMN "started_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "image_analyses" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "attachments" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "suggested_exams"."suggested_by" IS NULL`);
        await queryRunner.query(`ALTER TABLE "suggested_exams" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "care_instructions"."provided_by" IS NULL`);
        await queryRunner.query(`ALTER TABLE "care_instructions" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "urgency_level" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "symptoms" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_653c27d1b10652eb0c7bbbc442" ON "doctors" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d9dea74916617da4a95c8cce52" ON "users" ("cognito_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e97d9cc32d58808894cfb86b7" ON "prescriptions" ("memed_prescription_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_416055516c115bc14cf34f012d" ON "prescriptions" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2d6a1941bd705056030c2b9e07" ON "prescriptions" ("doctor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9389db557647131856661f7d7b" ON "prescriptions" ("patient_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_976d656e9de5a32f99a1fe6414" ON "prescriptions" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a437808c05488340de653aa19b" ON "memed_prescriptors" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d8dcae2b7abd337a46c6bc5e0" ON "memed_prescriptors" ("memed_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7cd52f47e5be999fa3dd8609e7" ON "memed_prescriptors" ("memed_external_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87e9967c596f5008b8a3f54a54" ON "locations" ("postal_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_f1a9093eafe4afa3a5ee8ca096" ON "locations" ("city") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d86e811a6eeb8a467fdbb0152" ON "locations" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0d755857c70341a60b7054770" ON "locations" ("latitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_c39c0d01058a6cd46054fd1af0" ON "locations" ("longitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_48db887c8226495cba27db51f6" ON "locations" ("geocoding_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_cb382e92f641c2776311fdde8f" ON "locations" ("geocoding_attempts") `);
        await queryRunner.query(`CREATE INDEX "IDX_501e65a3fc81f4438047b7bfc8" ON "locations" ("google_place_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ce3e3a12a5e07fe82d42d8738" ON "locations" ("google_rating") `);
        await queryRunner.query(`CREATE INDEX "IDX_8cc85028d44ae1c598215b1643" ON "providers" ("operator_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc7c6adc17252226ed5f3ccb95" ON "providers" ("location_hash") `);
        await queryRunner.query(`CREATE INDEX "IDX_d735474e539e674ba3702eddc4" ON "providers" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_907334e8cae69a99734e4a9910" ON "providers" ("insurance_company") `);
        await queryRunner.query(`CREATE INDEX "IDX_816b7c517bea7240587a228db7" ON "providers" ("is_active") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_323f93843bab3674d050ee2d64" ON "providers" ("name", "location_hash", "operator_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7a40b21f8fd548be206fcc89b" ON "services" ("provider_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfdcce31c9c571f9e5a8226dec" ON "services" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_0eff1efc3c8e7eb148ce62597b" ON "imports" ("operator_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d371c5c5522c7e62f84600e4cd" ON "imports" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d68056018d5e3fca40d6b11e2" ON "imports" ("started_at") `);
        await queryRunner.query(`CREATE INDEX "idx_company_tenant_id" ON "companies" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "idx_company_active" ON "companies" ("active") `);
        await queryRunner.query(`CREATE INDEX "idx_company_cnpj" ON "companies" ("cnpj") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = process.env.DB_SCHEMA || 'public';
        await queryRunner.query(`SET search_path TO "${schema}", "public"`);
        await queryRunner.query(`ALTER TABLE "symptoms" DROP CONSTRAINT "FK_b2f6d64946f5e6b6756f3803aff"`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" DROP CONSTRAINT "FK_9633bf8362ccd122e9921592d73"`);
        await queryRunner.query(`ALTER TABLE "care_instructions" DROP CONSTRAINT "FK_63e55a9fb70a45bf1b2205613ab"`);
        await queryRunner.query(`ALTER TABLE "suggested_exams" DROP CONSTRAINT "FK_98eee842216843db44956044410"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_3172ca60c4c5afb9ced63334543"`);
        await queryRunner.query(`ALTER TABLE "image_analyses" DROP CONSTRAINT "FK_1ac382d184ffaa373b5f2821daa"`);
        await queryRunner.query(`ALTER TABLE "healthcare_claims" DROP CONSTRAINT "FK_93ee75e2c434d6394a837480c12"`);
        await queryRunner.query(`ALTER TABLE "provider_metrics" DROP CONSTRAINT "FK_5dd39d8349372ad4631d482df68"`);
        await queryRunner.query(`ALTER TABLE "provider_name_mappings" DROP CONSTRAINT "FK_4b8224381df4633453334b4be3d"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_bc7c6adc17252226ed5f3ccb95e"`);
        await queryRunner.query(`ALTER TABLE "memed_prescriptors" DROP CONSTRAINT "FK_a437808c05488340de653aa19b3"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_2d6a1941bd705056030c2b9e07d"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        const dropIndexes = [
            'idx_company_cnpj',
            'idx_company_active',
            'idx_company_tenant_id',
            'IDX_9d68056018d5e3fca40d6b11e2',
            'IDX_d371c5c5522c7e62f84600e4cd',
            'IDX_0eff1efc3c8e7eb148ce62597b',
            'IDX_cfdcce31c9c571f9e5a8226dec',
            'IDX_e7a40b21f8fd548be206fcc89b',
            'IDX_323f93843bab3674d050ee2d64',
            'IDX_816b7c517bea7240587a228db7',
            'IDX_907334e8cae69a99734e4a9910',
            'IDX_d735474e539e674ba3702eddc4',
            'IDX_bc7c6adc17252226ed5f3ccb95',
            'IDX_8cc85028d44ae1c598215b1643',
            'IDX_4ce3e3a12a5e07fe82d42d8738',
            'IDX_501e65a3fc81f4438047b7bfc8',
            'IDX_cb382e92f641c2776311fdde8f',
            'IDX_48db887c8226495cba27db51f6',
            'IDX_c39c0d01058a6cd46054fd1af0',
            'IDX_a0d755857c70341a60b7054770',
            'IDX_8d86e811a6eeb8a467fdbb0152',
            'IDX_f1a9093eafe4afa3a5ee8ca096',
            'IDX_87e9967c596f5008b8a3f54a54',
            'IDX_7cd52f47e5be999fa3dd8609e7',
            'IDX_3d8dcae2b7abd337a46c6bc5e0',
            'IDX_a437808c05488340de653aa19b',
            'IDX_976d656e9de5a32f99a1fe6414',
            'IDX_9389db557647131856661f7d7b',
            'IDX_2d6a1941bd705056030c2b9e07',
            'IDX_416055516c115bc14cf34f012d',
            'IDX_4e97d9cc32d58808894cfb86b7',
            'IDX_d9dea74916617da4a95c8cce52',
            'IDX_653c27d1b10652eb0c7bbbc442',
        ];

        for (const indexName of dropIndexes) {
            await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."${indexName}"`);
        }
        await queryRunner.query(`ALTER TABLE "symptoms" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ALTER COLUMN "urgency_level" SET DEFAULT 'STANDARD'`);
        await queryRunner.query(`ALTER TABLE "care_instructions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "care_instructions"."provided_by" IS 'AI or DOCTOR'`);
        await queryRunner.query(`ALTER TABLE "suggested_exams" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "suggested_exams"."suggested_by" IS 'AI or DOCTOR'`);
        await queryRunner.query(`ALTER TABLE "attachments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "image_analyses" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "imports" ALTER COLUMN "started_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_last_fetched_at" IS 'Timestamp of the last Google Places data fetch'`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_place_url" IS 'Google Maps URL for this place'`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_weekday_text" IS 'Opening hours in text format for each day of the week (JSON array)'`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_user_ratings_total" IS 'Total number of user ratings on Google'`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_rating" IS 'Google Places rating (0-5)'`);
        await queryRunner.query(`COMMENT ON COLUMN "locations"."google_place_id" IS 'Google Places unique identifier'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."profile_picture_url" IS 'URL of the user profile picture stored in S3'`);
        await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        const dropHealthcareIndexes = [
            'IDX_93ee75e2c434d6394a837480c1',
            'IDX_59ccf2656dc6549f1da0053d20',
            'IDX_3dddd80d12eeb09512ebd1ceeb',
            'IDX_26f3619a9819fc321774ec03de',
            'IDX_1da31b4874b72e4e84287c0904',
            'IDX_10440aae893ac3408f13b3e757',
            'IDX_9a64bae6108f0d4f5282de6c91',
        ];

        for (const indexName of dropHealthcareIndexes) {
            await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."${indexName}"`);
        }
        await queryRunner.query(`DROP TABLE "healthcare_claims"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."IDX_5dd39d8349372ad4631d482df6"`);
        await queryRunner.query(`DROP TABLE "provider_metrics"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."IDX_abf3da535fcae62c49b5d57479"`);
        await queryRunner.query(`DROP TABLE "provider_name_mappings"`);
        await queryRunner.query(`CREATE INDEX "idx_companies_cnpj" ON "companies" ("cnpj") `);
        await queryRunner.query(`CREATE INDEX "idx_companies_active" ON "companies" ("active") `);
        await queryRunner.query(`CREATE INDEX "idx_companies_tenant_id" ON "companies" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "idx_symptoms_request" ON "symptoms" ("medical_approval_request_id") `);
        await queryRunner.query(`CREATE INDEX "idx_care_instructions_request" ON "care_instructions" ("medical_approval_request_id") `);
        await queryRunner.query(`CREATE INDEX "idx_suggested_exams_request" ON "suggested_exams" ("medical_approval_request_id") `);
        await queryRunner.query(`CREATE INDEX "idx_imports_operator_id" ON "imports" ("operator_id") `);
        await queryRunner.query(`CREATE INDEX "idx_imports_started_at" ON "imports" ("started_at") `);
        await queryRunner.query(`CREATE INDEX "idx_imports_status" ON "imports" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_services_category" ON "services" ("category") `);
        await queryRunner.query(`CREATE INDEX "idx_services_provider_id" ON "services" ("provider_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_providers_name_location" ON "providers" ("location_hash", "name") `);
        await queryRunner.query(`CREATE INDEX "idx_providers_is_active" ON "providers" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_providers_insurance_company" ON "providers" ("insurance_company") `);
        await queryRunner.query(`CREATE INDEX "idx_providers_name" ON "providers" ("name") `);
        await queryRunner.query(`CREATE INDEX "idx_providers_location_hash" ON "providers" ("location_hash") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_google_rating" ON "locations" ("google_rating") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_google_place_id" ON "locations" ("google_place_id") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_geocoding_attempts" ON "locations" ("geocoding_attempts") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_geocoding_status" ON "locations" ("geocoding_status") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_longitude" ON "locations" ("longitude") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_latitude" ON "locations" ("latitude") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_state" ON "locations" ("state") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_city" ON "locations" ("city") `);
        await queryRunner.query(`CREATE INDEX "idx_locations_postal_code" ON "locations" ("postal_code") `);
        await queryRunner.query(`CREATE INDEX "idx_memed_prescriptors_memed_external_id" ON "memed_prescriptors" ("memed_external_id") `);
        await queryRunner.query(`CREATE INDEX "idx_memed_prescriptors_memed_id" ON "memed_prescriptors" ("memed_id") `);
        await queryRunner.query(`CREATE INDEX "idx_memed_prescriptors_user_id" ON "memed_prescriptors" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prescriptions_memed_prescription_id" ON "prescriptions" ("memed_prescription_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prescriptions_session_id" ON "prescriptions" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prescriptions_patient_id" ON "prescriptions" ("patient_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prescriptions_doctor_id" ON "prescriptions" ("doctor_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prescriptions_tenant_id" ON "prescriptions" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "idx_users_cpf" ON "users" ("cpf") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_cognito_id" ON "users" ("cognito_id") `);
        await queryRunner.query(`CREATE INDEX "idx_doctors_board_info" ON "doctors" ("board_code", "board_number", "board_state") `);
        await queryRunner.query(`CREATE INDEX "IDX_doctors_user_id" ON "doctors" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "symptoms" ADD CONSTRAINT "FK_symptoms_medical_approval_request" FOREIGN KEY ("medical_approval_request_id") REFERENCES "medical_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "medical_approval_requests" ADD CONSTRAINT "FK_medical_approval_requests_assigned_doctor" FOREIGN KEY ("assigned_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "care_instructions" ADD CONSTRAINT "FK_care_instructions_medical_approval_request" FOREIGN KEY ("medical_approval_request_id") REFERENCES "medical_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "suggested_exams" ADD CONSTRAINT "FK_suggested_exams_medical_approval_request" FOREIGN KEY ("medical_approval_request_id") REFERENCES "medical_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD CONSTRAINT "FK_attachments_medical_approval_request" FOREIGN KEY ("medical_approval_request_id") REFERENCES "medical_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "image_analyses" ADD CONSTRAINT "FK_image_analyses_medical_approval_request" FOREIGN KEY ("medical_approval_request_id") REFERENCES "medical_approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "fk_services_provider" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "fk_providers_location" FOREIGN KEY ("location_hash") REFERENCES "locations"("hash") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "memed_prescriptors" ADD CONSTRAINT "FK_memed_prescriptors_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_prescriptions_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_doctors_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
