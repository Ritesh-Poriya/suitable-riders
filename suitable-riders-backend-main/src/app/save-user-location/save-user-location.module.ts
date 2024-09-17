import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaveUserLocation,
  SaveUserLocationSchema,
} from './entity/save-user-location.entity';
import { SaveUserLocationController } from './save-user-location.controller';
import { SaveUserLocationServices } from './save-user-location.service';

/**
 * Save user location module
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaveUserLocation.name, schema: SaveUserLocationSchema },
    ]),
  ],
  controllers: [SaveUserLocationController],
  providers: [SaveUserLocationServices, Logger],
  exports: [SaveUserLocationServices],
})
export class SaveUserLocationModule {}
