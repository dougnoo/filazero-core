import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import { MemedStatus } from '../../../../shared/domain/enums/memed-status.enum';

@Entity({
  name: 'memed_prescriptors',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
export class MemedPrescriptorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  @Index()
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'memed_id', unique: true })
  @Index()
  memedId: number;

  @Column({ name: 'memed_token', length: 500 })
  memedToken: string;

  @Column({ name: 'memed_external_id', unique: true })
  @Index()
  memedExternalId: string;

  @Column({
    name: 'memed_status',
    type: 'enum',
    enum: MemedStatus,
  })
  memedStatus: MemedStatus;

  @Column({ name: 'city_id', nullable: true })
  cityId?: number;

  @Column({ name: 'specialty_id', nullable: true })
  specialtyId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
