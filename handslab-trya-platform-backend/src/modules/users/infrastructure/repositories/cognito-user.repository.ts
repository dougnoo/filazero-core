import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  MessageActionType,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  IUserRepository,
  CreateCognitoUserDto,
  CognitoUser,
} from '../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';

@Injectable()
export class CognitoUserRepository implements IUserRepository {
  private readonly logger = new Logger(CognitoUserRepository.name);
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor(private configService: ConfigService) {
    // Cognito pode estar em região diferente (ex: us-east-1) do restante da app (ex: sa-east-1)
    const cognitoRegion =
      this.configService.get<string>('aws.cognito.region') || 'us-east-1';

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: cognitoRegion,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    const userPoolId = this.configService.get<string>('aws.cognito.userPoolId');

    if (!userPoolId) {
      throw new Error('Cognito User Pool ID is not configured');
    }

    this.userPoolId = userPoolId;
  }

  async userExists(email: string): Promise<boolean> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.cognitoClient.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        return false;
      }
      this.logger.error(
        `Error checking if user exists: ${error.name}`,
        error.stack,
      );
      throw error;
    }
  }

  async createUser(data: CreateCognitoUserDto): Promise<CognitoUser> {
    try {
      // Generate username from name if not provided
      const username = data.username || this.generateUsername(data.name);

      // Build user attributes array
      const userAttributes = [
        {
          Name: 'email',
          Value: data.email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'name',
          Value: data.name,
        },
      ];

      // Add phone_number if provided
      if (data.phoneNumber) {
        userAttributes.push({
          Name: 'phone_number',
          Value: data.phoneNumber,
        });
      }

      // Add gender
      userAttributes.push({
        Name: 'gender',
        Value: data.gender,
      });

      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        TemporaryPassword: data.temporaryPassword,
        UserAttributes: userAttributes,
        MessageAction: MessageActionType.SUPPRESS,
        DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
      });

      const response = await this.cognitoClient.send(command);

      if (!response.User || !response.User.Username) {
        throw new Error('Failed to create user in Cognito');
      }

      const cognitoId =
        response.User.Attributes?.find((attr) => attr.Name === 'sub')?.Value ||
        '';

      return {
        username: response.User.Username,
        email: data.email,
        cognitoId,
      };
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        throw new UserAlreadyExistsError(data.email);
      }
      this.logger.error(`Error creating user: ${error.name}`, error.stack);
      throw error;
    }
  }

  async assignRole(username: string, role: UserRole): Promise<void> {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: role,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      this.logger.error(`Error assigning role: ${error.name}`, error.stack);
      throw error;
    }
  }

  async updateCustomAttribute(
    email: string,
    attributeName: string,
    value: string,
  ): Promise<void> {
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          {
            Name: `custom:${attributeName}`,
            Value: value,
          },
        ],
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(email);
      }
      this.logger.error(
        `Error updating custom attribute: ${error.name}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteUser(email: string): Promise<void> {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(email);
      }
      this.logger.error(`Error deleting user: ${error.name}`, error.stack);
      throw error;
    }
  }

  async disableUser(email: string): Promise<void> {
    try {
      const command = new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(email);
      }
      this.logger.error(`Error disabling user: ${error.name}`, error.stack);
      throw error;
    }
  }

  async enableUser(email: string): Promise<void> {
    try {
      const command = new AdminEnableUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(email);
      }
      this.logger.error(`Error enabling user: ${error.name}`, error.stack);
      throw error;
    }
  }

  /**
   * Generates a unique username based on the user's name
   * Format: name_timestamp_random
   */
  private generateUsername(name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    // Clean and format the name
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .substring(0, 20); // Limit size

    return `${cleanName}_${timestamp}_${random}`;
  }
}
