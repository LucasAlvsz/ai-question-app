import { WebSocketConnection } from "@/entities/web-socket-connection";
import { WebSocketService } from "@/services/web-socket.service";
import { NotifyUserUseCase } from "@/use-cases/notify-user.use-case";

const mockGetConnectionsByUserId = jest.fn();
const mockSendMessageToAllConnections = jest.fn();

const mockWebSocketService: WebSocketService = {
  getConnectionsByUserId: mockGetConnectionsByUserId,
  sendMessageToAllConnections: mockSendMessageToAllConnections,
} as unknown as WebSocketService;

describe("NotifyUserUseCase", () => {
  const useCase = new NotifyUserUseCase(mockWebSocketService);

  const userId = "user-123";
  const payload = { message: "resposta disponível" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should do nothing if no connections are found", async () => {
    mockGetConnectionsByUserId.mockResolvedValue(null);

    await useCase.execute({ userId, payload });

    expect(mockGetConnectionsByUserId).toHaveBeenCalledWith(userId);
    expect(mockSendMessageToAllConnections).not.toHaveBeenCalled();
  });

  it("should send message if connections exist", async () => {
    const connections: WebSocketConnection[] = [
      { id: "conn-1", userId },
      { id: "conn-2", userId },
    ];

    mockGetConnectionsByUserId.mockResolvedValue(connections);

    await useCase.execute({ userId, payload });

    expect(mockGetConnectionsByUserId).toHaveBeenCalledWith(userId);
    expect(mockSendMessageToAllConnections).toHaveBeenCalledWith(["conn-1", "conn-2"], payload);
  });
});
