import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventTypes } from 'src/app/common/@types/eventType';
import { DriverDeletedEventPayload } from 'src/app/driver-profile/@types/driver-deleted.event';
import { VehicleService } from '../vehicle.service';

@Injectable()
export class VehicleEventListener {
  constructor(private vehicleService: VehicleService) {}

  @OnEvent(EventTypes.DriverDeleted)
  async onDriverDeleted(payload: DriverDeletedEventPayload) {
    await this.vehicleService.deleteVehicleByUserId(payload.userID);
  }
}
