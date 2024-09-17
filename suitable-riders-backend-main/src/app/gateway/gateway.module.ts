import { Module, forwardRef } from '@nestjs/common';
import { DeliveryGateway } from './gateway';
import { JobModule } from '../job/job.module';

@Module({
  imports: [forwardRef(() => JobModule)],
  providers: [DeliveryGateway],
  exports: [],
})
export class GatewayModule {}
