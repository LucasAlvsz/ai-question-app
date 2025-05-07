import { WebSocketService } from "@/services/web-socket.service";

interface NotifyUserInput {
  userId: string;
  payload: object;
}

export class NotifyUserUseCase {
  constructor(private readonly webSocketService: WebSocketService) {}

  async execute({ userId, payload }: NotifyUserInput): Promise<void> {
    const connections = await this.webSocketService.getConnectionsByUserId(userId);

    if (!connections || connections.length === 0) {
      return;
    }

    const connectionsIds = connections.map((connection) => connection.id);
    await this.webSocketService.sendMessageToAllConnections(connectionsIds, payload);
  }
}
