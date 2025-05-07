import { WebSocketConnection } from "@/entities/web-socket-connection";
import { WebSocketService } from "@/services/web-socket.service";
import { RegisterConnectionUseCase } from "@/use-cases/register-web-socket-connection.use-case";

const mockSaveNewConnection = jest.fn();

const mockWebSocketService: WebSocketService = {
  saveNewConnection: mockSaveNewConnection,
} as unknown as WebSocketService;

describe("RegisterConnectionUseCase", () => {
  const useCase = new RegisterConnectionUseCase(mockWebSocketService);

  const connectionData: WebSocketConnection = {
    id: "conn-123",
    userId: "user-456",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call saveNewConnection with connection data", async () => {
    await useCase.execute(connectionData);

    expect(mockSaveNewConnection).toHaveBeenCalledWith({
      id: "conn-123",
      userId: "user-456",
    });
  });
});
