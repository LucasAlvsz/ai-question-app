import { WebSocketConnection } from "@/entities/web-socket-connection";

export interface WebSocketConnectionRepository {
  save(connectionData: WebSocketConnection): Promise<void>;
  getByUserId(userId: string): Promise<WebSocketConnection[] | null>;
  delete(connectionId: string): Promise<void>;
}
