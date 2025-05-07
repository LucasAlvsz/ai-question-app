import { WebSocketConnection } from "@/entities/web-socket-connection";
import { WebSocketService } from "@/services/web-socket.service";

export class RegisterConnectionUseCase {
  constructor(private readonly webSocketConnectionService: WebSocketService) {}

  async execute(webSocketConnectionData: WebSocketConnection): Promise<void> {
    const { id: connectionId, userId } = webSocketConnectionData;
    await this.webSocketConnectionService.saveNewConnection({ id: connectionId, userId });
  }
}
