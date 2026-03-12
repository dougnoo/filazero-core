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
import { UserEntity } from './user.entity';
import { BoardCode } from '../../../../shared/domain/enums/board-code.enum';

@Entity({ name: 'doctors', schema: process.env.DB_SCHEMA || 'platform_dev' })
export class DoctorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    nullable: true,
    name: 'board_code',
    type: 'enum',
    enum: BoardCode,
  })
  boardCode?: BoardCode;

  @Column({ nullable: true, name: 'board_number', length: 50 })
  boardNumber?: string;

  @Column({ nullable: true, name: 'board_state', length: 2 })
  boardState?: string; // UF

  @Column()
  specialty: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity, (user) => user.doctor)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
