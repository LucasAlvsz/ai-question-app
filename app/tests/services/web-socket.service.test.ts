import { WebSocketConnection } from "@/entities/web-socket-connection";
import { WebSocketConnectionRepository } from "@/repositories/web-socket-connection-repository/web-socket-connection.repository";
import { WebSocketService } from "@/services/web-socket.service";
import { webSocketClient } from "@/shared/aws/clients/web-socket";

jest.mock("@/shared/aws/clients/web-socket", () => ({
  webSocketClient: {
    send: jest.fn(),
  },
}));

describe("WebSocketService", () => {
  const mockSave = jest.fn();
  const mockGetByUserId = jest.fn();
  const mockDelete = jest.fn();

  const mockRepo: WebSocketConnectionRepository = {
    save: mockSave,
    getByUserId: mockGetByUserId,
    delete: mockDelete,
  };

  const service = new WebSocketService(mockRepo);

  const sampleConnection: WebSocketConnection = {
    id: "conn-id-123",
    userId: "user-456",
  };

  const payload = { message: "hello" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call webSocketConnectionRepo.save on saveNewConnection", async () => {
    await service.saveNewConnection(sampleConnection);
    expect(mockSave).toHaveBeenCalledWith(sampleConnection);
  });

  it("should call webSocketConnectionRepo.getByUserId on getConnectionsByUserId", async () => {
    await service.getConnectionsByUserId("user-456");
    expect(mockGetByUserId).toHaveBeenCalledWith("user-456");
  });

  it("should call webSocketConnectionRepo.delete on deleteConnection", async () => {
    await service.deleteConnection("conn-id-123");
    expect(mockDelete).toHaveBeenCalledWith("conn-id-123");
  });

  it("should call webSocketClient.send with PostToConnectionCommand on sendMessageToConnection", async () => {
    await service.sendMessageToConnection("conn-id-123", payload);

    expect(webSocketClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          ConnectionId: "conn-id-123",
          Data: Buffer.from(JSON.stringify(payload)),
        },
      }),
    );
  });

  it("should call sendMessageToConnection for each connection in sendMessageToAllConnections", async () => {
    const spy = jest.spyOn(service, "sendMessageToConnection");
    const ids = ["conn-1", "conn-2", "conn-3"];

    await service.sendMessageToAllConnections(ids, payload);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, "conn-1", payload);
    expect(spy).toHaveBeenNthCalledWith(2, "conn-2", payload);
    expect(spy).toHaveBeenNthCalledWith(3, "conn-3", payload);
  });
});
