import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../shared/domain/enums/gender.enum';
import { Doctor } from './doctor.entity';

export class User {
  id: string;
  cognitoId: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  gender: Gender;
  active: boolean;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  doctor?: Doctor;

  constructor(data: {
    id: string;
    cognitoId: string;
    email: string;
    name: string;
    role: UserRole;
    phone: string;
    gender: Gender;
    active: boolean;
    profilePictureUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    doctor?: Doctor;
  }) {
    this.id = data.id;
    this.cognitoId = data.cognitoId;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role;
    this.phone = data.phone;
    this.gender = data.gender;
    this.active = data.active;
    this.profilePictureUrl = data.profilePictureUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.doctor = data.doctor;
  }
}
