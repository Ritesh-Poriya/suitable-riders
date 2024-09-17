import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JobService } from '../job/job.service';
import { OnEvent } from '@nestjs/event-emitter';
import { GatewayEventType } from './@types/gateway.types';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DeliveryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private jobService: JobService) {}
  @WebSocketServer() server: Server;

  private connectedClients = new Set<string>();
  async handleConnection(client: Socket): Promise<void> {
    // Join the client to a room based on the order ID
    const orderId = client.handshake.query.orderId;
    if (orderId) {
      client.join(`order_${orderId}`);
    }
    this.connectedClients.add(client.id);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.connectedClients.delete(client.id);
  }

  @OnEvent(GatewayEventType.UPDATE_COORDINATIONS)
  async sendDeliveryLocation(orderId: string) {
    const coordinates =
      this.jobService.getRidersCoordinationsByOrderID(orderId);
    if (coordinates) {
      this.server.to(orderId).emit('delivery', { coordinates });
    }
  }
}
