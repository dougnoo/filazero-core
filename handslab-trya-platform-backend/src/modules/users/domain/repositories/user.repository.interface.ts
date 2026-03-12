import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../shared/domain/enums/gender.enum';

export interface CreateCognitoUserDto {
  username?: string; // Optional - will be auto-generated if not provided
  email: string;
  name: string;
  role: UserRole;
  phoneNumber: string;
  gender: Gender;
  temporaryPassword: string;
}

export interface CognitoUser {
  username: string;
  email: string;
  cognitoId: string;
}

export interface IUserRepository {
  userExists(email: string): Promise<boolean>;
  createUser(data: CreateCognitoUserDto): Promise<CognitoUser>;
  assignRole(username: string, role: UserRole): Promise<void>;
  updateCustomAttribute(
    email: string,
    attributeName: string,
    value: string,
  ): Promise<void>;
  deleteUser(email: string): Promise<void>;
  disableUser(email: string): Promise<void>;
  enableUser(email: string): Promise<void>;
}
