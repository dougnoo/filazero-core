import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { TutorialStatus } from '../enums/tutorial-status.enum';
import { Tutorial } from './tutorial.entity';
import { User } from 'src/database/entities/user.entity';

@Entity('user_tutorial')
@Index(['userId', 'tutorialId', 'tenantId'], { unique: true })
@Index(['tenantId'])
export class UserTutorialProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  tutorialId: string;

  @ManyToOne(() => Tutorial)
  @JoinColumn({ name: 'tutorialId' })
  tutorial: Tutorial;

  @Column({ type: 'timestamp' })
  completedAt: Date;

  @Column({ default: false })
  skipped: boolean;

  @Column('uuid')
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
