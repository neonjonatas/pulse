import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit
} from '@nestjs/websockets'
import type { Server } from 'socket.io'

@WebSocketGateway({
  namespace: '/pipeline',
  cors: { origin: '*' }
})
export class PipelineGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server

  afterInit(): void {
    console.log('[Backstage] Pipeline WebSocket ready at /pipeline')
  }
}
