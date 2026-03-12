import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../shared/domain/enums/gender.enum';
import { DoctorEntity } from './doctor.entity';

@Entity({ name: 'users', schema: process.env.DB_SCHEMA || 'platform_dev' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'cognito_id' })
  @Index()
  cognitoId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, length: 11 })
  cpf: string;

  @Column({ nullable: true, name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true, name: 'profile_picture_url' })
  profilePictureUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => DoctorEntity, (doctor) => doctor.user, { cascade: true })
  doctor?: DoctorEntity;
}
