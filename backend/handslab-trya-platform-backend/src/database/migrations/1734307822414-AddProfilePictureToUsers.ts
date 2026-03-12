import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfilePictureToUsers1734307822414 implements MigrationInterface {
  name = 'AddProfilePictureToUsers1734307822414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'profile_picture_url',
        type: 'varchar',
        isNullable: true,
        comment: 'URL of the user profile picture stored in S3',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'profile_picture_url');
  }
}
