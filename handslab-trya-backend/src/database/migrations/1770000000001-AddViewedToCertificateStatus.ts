import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewedToCertificateStatus1770000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona o valor VIEWED ao enum do status de atestados
    // O TypeORM cria enums com o nome da tabela + coluna + _enum
    await queryRunner.query(`
      ALTER TYPE "medical_certificates_status_enum" ADD VALUE IF NOT EXISTS 'VIEWED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL não permite remover valores de um enum diretamente
    // Para reverter, seria necessário:
    // 1. Criar um novo enum sem o valor VIEWED
    // 2. Atualizar todos os registros que usam VIEWED para outro valor
    // 3. Alterar a coluna para usar o novo enum
    // 4. Remover o enum antigo
    // Por simplicidade e segurança, esta migration não pode ser revertida
    console.warn(
      'Esta migration não pode ser revertida automaticamente. ' +
        'A remoção de valores de enum no PostgreSQL requer recriação manual do tipo.',
    );
  }
}
