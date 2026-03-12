import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  Unique,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Entity('tutorials')
@Index(['tenantId', 'targetRole', 'isActive'])
@Unique(['code', 'tenantId'])
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  code: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  version: string;

  @Column({ type: 'varchar' })
  targetRole: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @Column('uuid')
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
