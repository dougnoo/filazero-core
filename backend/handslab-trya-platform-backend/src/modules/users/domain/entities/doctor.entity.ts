import { User } from './user.entity';
import { BoardCode } from '../../../../shared/domain/enums/board-code.enum';

export class Doctor {
  id: string;
  userId: string;
  boardCode?: BoardCode;
  boardNumber?: string;
  boardState?: string;
  specialty: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;

  constructor(data: {
    id: string;
    userId: string;
    boardCode?: BoardCode;
    boardNumber?: string;
    boardState?: string;
    specialty: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.boardCode = data.boardCode;
    this.boardNumber = data.boardNumber;
    this.boardState = data.boardState;
    this.specialty = data.specialty;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.user = data.user;
  }
}
