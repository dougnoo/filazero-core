import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthcareFacilitiesService } from './healthcare-facilities.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [ConfigModule, LocationModule],
  providers: [HealthcareFacilitiesService],
  exports: [HealthcareFacilitiesService],
})
export class HealthcareFacilitiesModule {}

