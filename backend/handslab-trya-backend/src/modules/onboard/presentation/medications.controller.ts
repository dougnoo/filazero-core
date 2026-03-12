import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListMedicationsUseCase } from '../application/use-cases/list-medications.use-case';
import { ListMedicationsQueryDto } from './dtos/list-medications.query.dto';

@ApiTags('medications')
@ApiBearerAuth('JWT-auth')
@Controller('medications')
export class MedicationsController {
  constructor(private readonly listUseCase: ListMedicationsUseCase) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(@Query() query: ListMedicationsQueryDto) {
    return this.listUseCase.execute(query);
  }
}
