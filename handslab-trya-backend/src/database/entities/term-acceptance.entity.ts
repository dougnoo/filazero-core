import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { TermVersion } from './term-version.entity';

@Entity('term_acceptances')
@Index('IDX_term_acceptances_user_term', ['userId', 'termVersionId'], {
  unique: true,
})
@Index('IDX_term_acceptances_user', ['userId'])
export class TermAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'term_version_id', type: 'uuid' })
  termVersionId: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'accepted_at' })
  acceptedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_term_acceptances_user',
  })
  user: User;

  @ManyToOne(() => TermVersion, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'term_version_id',
    foreignKeyConstraintName: 'FK_term_acceptances_term_version',
  })
  termVersion: TermVersion;
}
