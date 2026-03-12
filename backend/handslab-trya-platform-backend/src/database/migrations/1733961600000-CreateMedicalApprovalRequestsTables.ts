import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateMedicalApprovalRequestsTables1733961600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create medical_approval_requests table
    await queryRunner.createTable(
      new Table({
        name: 'medical_approval_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'patient_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'PENDING'",
          },
          {
            name: 'assigned_doctor_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'urgency_level',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'chief_complaint',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'conversation_summary',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'care_recommendation',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'doctor_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        checks: [
          {
            name: 'chk_status',
            expression:
              "status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'ADJUSTED')",
          },
          {
            name: 'chk_urgency',
            expression:
              "urgency_level IN ('EMERGENCY', 'VERY_URGENT', 'URGENT', 'STANDARD', 'NON_URGENT')",
          },
        ],
      }),
      true,
    );

    // Create indexes for medical_approval_requests table
    await queryRunner.createIndex(
      'medical_approval_requests',
      new TableIndex({
        name: 'idx_mar_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'medical_approval_requests',
      new TableIndex({
        name: 'idx_mar_urgency',
        columnNames: ['urgency_level'],
      }),
    );

    await queryRunner.createIndex(
      'medical_approval_requests',
      new TableIndex({
        name: 'idx_mar_created',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'medical_approval_requests',
      new TableIndex({
        name: 'idx_mar_session',
        columnNames: ['session_id'],
      }),
    );

    // Create foreign key for assigned_doctor_id
    await queryRunner.createForeignKey(
      'medical_approval_requests',
      new TableForeignKey({
        name: 'FK_medical_approval_requests_assigned_doctor',
        columnNames: ['assigned_doctor_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Create image_analyses table
    await queryRunner.createTable(
      new Table({
        name: 'image_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medical_approval_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'num_images',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'context',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_response',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'detailed_analysis',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index for image_analyses table
    await queryRunner.createIndex(
      'image_analyses',
      new TableIndex({
        name: 'idx_ia_request',
        columnNames: ['medical_approval_request_id'],
      }),
    );

    // Create foreign key for image_analyses
    await queryRunner.createForeignKey(
      'image_analyses',
      new TableForeignKey({
        name: 'FK_image_analyses_medical_approval_request',
        columnNames: ['medical_approval_request_id'],
        referencedTableName: 'medical_approval_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create attachments table
    await queryRunner.createTable(
      new Table({
        name: 'attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medical_approval_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 's3_key',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_type',
            type: 'varchar',
            length: '50',
            default: "'image'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index for attachments table
    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'idx_att_request',
        columnNames: ['medical_approval_request_id'],
      }),
    );

    // Create foreign key for attachments
    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        name: 'FK_attachments_medical_approval_request',
        columnNames: ['medical_approval_request_id'],
        referencedTableName: 'medical_approval_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create symptoms table
    await queryRunner.createTable(
      new Table({
        name: 'symptoms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medical_approval_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_main',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'symptoms',
      new TableIndex({
        name: 'idx_symptoms_request',
        columnNames: ['medical_approval_request_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'symptoms',
      new TableForeignKey({
        name: 'FK_symptoms_medical_approval_request',
        columnNames: ['medical_approval_request_id'],
        referencedTableName: 'medical_approval_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create suggested_exams table
    await queryRunner.createTable(
      new Table({
        name: 'suggested_exams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medical_approval_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'suggested_by',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'AI or DOCTOR',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'suggested_exams',
      new TableIndex({
        name: 'idx_suggested_exams_request',
        columnNames: ['medical_approval_request_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'suggested_exams',
      new TableForeignKey({
        name: 'FK_suggested_exams_medical_approval_request',
        columnNames: ['medical_approval_request_id'],
        referencedTableName: 'medical_approval_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create care_instructions table
    await queryRunner.createTable(
      new Table({
        name: 'care_instructions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medical_approval_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'instruction',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'provided_by',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'AI or DOCTOR',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'care_instructions',
      new TableIndex({
        name: 'idx_care_instructions_request',
        columnNames: ['medical_approval_request_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'care_instructions',
      new TableForeignKey({
        name: 'FK_care_instructions_medical_approval_request',
        columnNames: ['medical_approval_request_id'],
        referencedTableName: 'medical_approval_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop care_instructions table
    await queryRunner.dropForeignKey(
      'care_instructions',
      'FK_care_instructions_medical_approval_request',
    );
    await queryRunner.dropIndex(
      'care_instructions',
      'idx_care_instructions_request',
    );
    await queryRunner.dropTable('care_instructions');

    // Drop suggested_exams table
    await queryRunner.dropForeignKey(
      'suggested_exams',
      'FK_suggested_exams_medical_approval_request',
    );
    await queryRunner.dropIndex(
      'suggested_exams',
      'idx_suggested_exams_request',
    );
    await queryRunner.dropTable('suggested_exams');

    // Drop symptoms table
    await queryRunner.dropForeignKey(
      'symptoms',
      'FK_symptoms_medical_approval_request',
    );
    await queryRunner.dropIndex('symptoms', 'idx_symptoms_request');
    await queryRunner.dropTable('symptoms');

    // Drop attachments table
    await queryRunner.dropForeignKey(
      'attachments',
      'FK_attachments_medical_approval_request',
    );
    await queryRunner.dropIndex('attachments', 'idx_att_request');
    await queryRunner.dropTable('attachments');

    // Drop image_analyses table
    await queryRunner.dropForeignKey(
      'image_analyses',
      'FK_image_analyses_medical_approval_request',
    );
    await queryRunner.dropIndex('image_analyses', 'idx_ia_request');
    await queryRunner.dropTable('image_analyses');

    // Drop medical_approval_requests table
    await queryRunner.dropForeignKey(
      'medical_approval_requests',
      'FK_medical_approval_requests_assigned_doctor',
    );
    await queryRunner.dropIndex('medical_approval_requests', 'idx_mar_session');
    await queryRunner.dropIndex('medical_approval_requests', 'idx_mar_created');
    await queryRunner.dropIndex('medical_approval_requests', 'idx_mar_urgency');
    await queryRunner.dropIndex('medical_approval_requests', 'idx_mar_status');
    await queryRunner.dropTable('medical_approval_requests');
  }
}
