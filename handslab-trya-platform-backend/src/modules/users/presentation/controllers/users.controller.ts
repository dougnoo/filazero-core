import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin/create-admin.use-case';
import { CreateDoctorUseCase } from '../../application/use-cases/create-doctor/create-doctor.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users/list-users.use-case';
import { ListDoctorsUseCase } from '../../application/use-cases/list-doctors/list-doctors.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user/get-user.use-case';
import { GetDoctorUseCase } from '../../application/use-cases/get-doctor/get-doctor.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user/update-user.use-case';
import { UpdateDoctorUseCase } from '../../application/use-cases/update-doctor/update-doctor.use-case';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user/deactivate-user.use-case';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user/activate-user.use-case';
import { CreateAdminDto } from '../../application/use-cases/create-admin/create-admin.dto';
import { CreateAdminResponseDto } from '../../application/use-cases/create-admin/create-admin-response.dto';
import { CreateDoctorDto } from '../../application/use-cases/create-doctor/create-doctor.dto';
import { CreateDoctorResponseDto } from '../../application/use-cases/create-doctor/create-doctor-response.dto';
import { ListUsersDto } from '../../application/use-cases/list-users/list-users.dto';
import { ListUsersResponseDto } from '../../application/use-cases/list-users/list-users-response.dto';
import { ListDoctorsDto } from '../../application/use-cases/list-doctors/list-doctors.dto';
import { ListDoctorsResponseDto } from '../../application/use-cases/list-doctors/list-doctors-response.dto';
import { GetUserResponseDto } from '../../application/use-cases/get-user/get-user-response.dto';
import { GetDoctorResponseDto } from '../../application/use-cases/get-doctor/get-doctor-response.dto';
import { UpdateUserDto } from '../../application/use-cases/update-user/update-user.dto';
import { UpdateUserResponseDto } from '../../application/use-cases/update-user/update-user-response.dto';
import { UpdateDoctorDto } from '../../application/use-cases/update-doctor/update-doctor.dto';
import { UpdateDoctorResponseDto } from '../../application/use-cases/update-doctor/update-doctor-response.dto';
import { UploadProfilePictureUseCase } from '../../application/use-cases/upload-profile-picture/upload-profile-picture.use-case';
import { ConfirmProfilePictureUseCase } from '../../application/use-cases/confirm-profile-picture/confirm-profile-picture.use-case';
import { UploadProfilePictureDto } from '../../application/use-cases/upload-profile-picture/upload-profile-picture.dto';
import { UploadProfilePictureResponseDto } from '../../application/use-cases/upload-profile-picture/upload-profile-picture-response.dto';
import { ConfirmProfilePictureDto } from '../../application/use-cases/confirm-profile-picture/confirm-profile-picture.dto';
import { ConfirmProfilePictureResponseDto } from '../../application/use-cases/confirm-profile-picture/confirm-profile-picture-response.dto';
import { DeleteProfilePictureUseCase } from '../../application/use-cases/delete-profile-picture/delete-profile-picture.use-case';
import { DeleteProfilePictureResponseDto } from '../../application/use-cases/delete-profile-picture/delete-profile-picture-response.dto';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly createDoctorUseCase: CreateDoctorUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listDoctorsUseCase: ListDoctorsUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getDoctorUseCase: GetDoctorUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateDoctorUseCase: UpdateDoctorUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly uploadProfilePictureUseCase: UploadProfilePictureUseCase,
    private readonly confirmProfilePictureUseCase: ConfirmProfilePictureUseCase,
    private readonly deleteProfilePictureUseCase: DeleteProfilePictureUseCase,
  ) {}

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new admin user',
    description:
      'Creates a new admin user in both Cognito and PostgreSQL. Requires ADMIN role. A temporary password will be generated if not provided.',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully.',
    type: CreateAdminResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to save user data to database.',
  })
  async createAdmin(
    @Body() dto: CreateAdminDto,
  ): Promise<CreateAdminResponseDto> {
    return this.createAdminUseCase.execute(dto);
  }

  @Post('doctor')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new doctor user',
    description:
      'Creates a new doctor user in both Cognito and PostgreSQL with medical credentials. Requires ADMIN role. A temporary password will be generated if not provided.',
  })
  @ApiResponse({
    status: 201,
    description: 'Doctor user created successfully.',
    type: CreateDoctorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to save user data to database.',
  })
  async createDoctor(
    @Body() dto: CreateDoctorDto,
  ): Promise<CreateDoctorResponseDto> {
    return this.createDoctorUseCase.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List all users with pagination and filtering',
    description:
      'Retrieves a paginated list of users. Supports filtering by role, active status, and search by name or email. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
    type: ListUsersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in query parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  async listUsers(@Query() query: ListUsersDto): Promise<ListUsersResponseDto> {
    return this.listUsersUseCase.execute(query);
  }

  @Get('doctor')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'List all doctors with pagination and filtering',
    description:
      'Retrieves a paginated list of doctors with their user information. Supports filtering by specialty, active status, and search by name, email, or CRM. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctors retrieved successfully.',
    type: ListDoctorsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in query parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  async listDoctors(
    @Query() query: ListDoctorsDto,
  ): Promise<ListDoctorsResponseDto> {
    return this.listDoctorsUseCase.execute(query);
  }

  @Get('doctor/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get doctor details by ID',
    description:
      'Retrieves detailed information about a specific doctor with flat structure (doctor + user fields at same level). Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor details retrieved successfully.',
    type: GetDoctorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found or user is not a doctor.',
  })
  async getDoctor(@Param('id') id: string): Promise<GetDoctorResponseDto> {
    return this.getDoctorUseCase.execute(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates user profile information including name and phone. All fields are optional. Requires ADMIN role. Use this for admin users.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
    type: UpdateUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update user profile.',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get user details by ID',
    description:
      'Retrieves detailed information about a specific user, including doctor profile if applicable. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
    type: GetUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async getUser(@Param('id') id: string): Promise<GetUserResponseDto> {
    return this.getUserUseCase.execute(id);
  }

  @Put('doctor/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Update doctor profile',
    description:
      'Updates doctor profile information including user fields (name, phone) and doctor-specific fields (CRM, specialty). All fields are optional. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor profile updated successfully.',
    type: UpdateDoctorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update doctor profile.',
  })
  async updateDoctor(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ): Promise<UpdateDoctorResponseDto> {
    return this.updateDoctorUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Deactivate a user',
    description:
      'Deactivates a user by setting active=false in PostgreSQL and disabling the user in Cognito. This is a soft delete operation. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 204,
    description: 'User deactivated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to deactivate user in Cognito.',
  })
  async deactivateUser(@Param('id') id: string): Promise<void> {
    return this.deactivateUserUseCase.execute(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Activate a user',
    description:
      'Activates a previously deactivated user by setting active=true in PostgreSQL and enabling the user in Cognito. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 204,
    description: 'User activated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to activate user in Cognito.',
  })
  async activateUser(@Param('id') id: string): Promise<void> {
    return this.activateUserUseCase.execute(id);
  }

  @Post('profile-picture/upload-url')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Generate presigned URL for profile picture upload',
    description:
      'Generates a presigned URL for uploading a profile picture to S3. Doctors can upload their own profile picture.',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully.',
    type: UploadProfilePictureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file extension. Only jpg and png are allowed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have required role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async generateUploadUrl(
    @Body() dto: UploadProfilePictureDto,
    @CurrentUser() currentUser: any,
  ): Promise<UploadProfilePictureResponseDto> {
    const cognitoId = currentUser.cognitoId;
    return this.uploadProfilePictureUseCase.execute(cognitoId, dto);
  }

  @Post('profile-picture/confirm')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Confirm profile picture upload',
    description:
      'Confirms that the profile picture has been uploaded to S3 and updates the user profile with the new URL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture updated successfully.',
    type: ConfirmProfilePictureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file key.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have required role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async confirmUpload(
    @Body() dto: ConfirmProfilePictureDto,
    @CurrentUser() currentUser: any,
  ): Promise<ConfirmProfilePictureResponseDto> {
    const cognitoId = currentUser.cognitoId;
    return this.confirmProfilePictureUseCase.execute(cognitoId, dto);
  }

  @Delete('profile-picture')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Delete profile picture',
    description:
      'Removes the current profile picture from S3 and updates the user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture removed successfully.',
    type: DeleteProfilePictureResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have DOCTOR role.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteProfilePicture(
    @CurrentUser() currentUser: any,
  ): Promise<DeleteProfilePictureResponseDto> {
    const cognitoId = currentUser.cognitoId;
    return this.deleteProfilePictureUseCase.execute(cognitoId);
  }
}
