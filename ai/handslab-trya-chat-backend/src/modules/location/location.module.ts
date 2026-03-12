import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocationService } from './location.service';
import { GeocodingService } from './geocoding.service';

@Module({
  imports: [ConfigModule],
  providers: [LocationService, GeocodingService],
  exports: [LocationService, GeocodingService],
})
export class LocationModule {}

