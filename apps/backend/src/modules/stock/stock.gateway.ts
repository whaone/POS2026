import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { StockService } from './stock.service';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: true, namespace: '/' })
export class StockGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly stockService: StockService) {}

  @SubscribeMessage('stock:check')
  async handleStockCheck(
    @MessageBody() data: { businessId: string; productId: string },
  ) {
    // Returns snapshot per location
    const result = await this.stockService.getStockByProduct(
      data.businessId,
      data.productId,
    );
    return result;
  }

  // Listen to internal event bus and broadcast to websocket clients
  @OnEvent('stock.changed')
  handleStockChangedEvent(payload: {
    businessId: string;
    locationId: string;
    productId: string;
    qty: number;
    qtyHeld: number;
  }) {
    this.server.emit('stock:changed', payload);
  }
}
