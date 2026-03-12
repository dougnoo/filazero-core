import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListChronicConditionsUseCase } from '../application/use-cases/list-chronic-conditions.use-case';
import { ListChronicConditionsQueryDto } from './dtos/list-chronic-conditions.query.dto';

@ApiTags('chronic-conditions')
@ApiBearerAuth('JWT-auth')
@Controller('chronic-conditions')
export class ChronicConditionsController {
  constructor(private readonly listUseCase: ListChronicConditionsUseCase) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(@Query() query: ListChronicConditionsQueryDto) {
    return this.listUseCase.execute(query);
  }
}
