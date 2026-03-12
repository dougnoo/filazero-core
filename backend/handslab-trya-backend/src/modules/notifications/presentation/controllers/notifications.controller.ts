import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProcessNotificationUseCase } from '../../application/use-cases/process-notification.use-case';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { GetLatestUnreadNotificationUseCase } from '../../application/use-cases/get-latest-unread-notification.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import { NotificationWebhookDto } from '../dtos/notification-webhook.dto';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { ApiKeyGuard } from '../../../platform-api/presentation/guards/api-key.guard';
import { Public } from '../../../auth/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';
import { Roles } from 'src/shared/presentation';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly processNotificationUseCase: ProcessNotificationUseCase,
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly getLatestUnreadNotificationUseCase: GetLatestUnreadNotificationUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @ApiSecurity('api-key')
  @Public()
  @UseGuards(ApiKeyGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive platform notifications' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'API Key' })
  @ApiResponse({ status: 200, description: 'Notification processed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  async receiveNotification(@Body() dto: NotificationWebhookDto) {
    await this.processNotificationUseCase.execute(dto.category, dto.data);
    return { success: true };
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'List user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved',
    type: [NotificationResponseDto],
  })
  async listNotifications(@CurrentUser() user: User) {
    return await this.listNotificationsUseCase.execute(user.dbId!);
  }

  @Get('latest-unread')
  @ApiBearerAuth()
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Get latest unread notification' })
  @ApiResponse({
    status: 200,
    description: 'Latest unread notification retrieved',
    type: NotificationResponseDto,
  })
  async getLatestUnread(@CurrentUser() user: User) {
    return await this.getLatestUnreadNotificationUseCase.execute(user.dbId!);
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @Roles(UserRole.BENEFICIARY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    await this.markNotificationAsReadUseCase.execute(id, user.dbId!);
  }
}
