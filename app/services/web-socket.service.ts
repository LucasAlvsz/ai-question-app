import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { WebSocketConnection } from "@/entities/web-socket-connection";
import { WebSocketConnectionRepository } from "@/repositories/web-socket-connection-repository/web-socket-connection.repository";
import { webSocketClient } from "@/shared/aws/clients/web-socket";

export class WebSocketService {
  constructor(private readonly webSocketConnectionRepo: WebSocketConnectionRepository) {}

  async saveNewConnection(connection: WebSocketConnection): Promise<void> {
    await this.webSocketConnectionRepo.save(connection);
  }

  async getConnectionsByUserId(userId: string): Promise<WebSocketConnection[] | null> {
    const connections = await this.webSocketConnectionRepo.getByUserId(userId);
    return connections;
  }

  async deleteConnection(connectionId: string): Promise<void> {
    await this.webSocketConnectionRepo.delete(connectionId);
  }

  async sendMessageToConnection(connectionId: string, payload: object): Promise<void> {
    await webSocketClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(payload)),
      }),
    );
  }

  async sendMessageToAllConnections(connectionsIds: string[], payload: object): Promise<void> {
    await Promise.all(
      connectionsIds.map(async (connectionId) => {
        await this.sendMessageToConnection(connectionId, payload);
      }),
    );
  }
}
