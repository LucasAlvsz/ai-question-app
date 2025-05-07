import { WebSocketService } from "@/services/web-socket.service";

export class RemoveWebSocketConnectionUseCase {
  constructor(private readonly webSocketConnectionService: WebSocketService) {}

  async execute(connectionId: string): Promise<void> {
    await this.webSocketConnectionService.deleteConnection(connectionId);
  }
}
