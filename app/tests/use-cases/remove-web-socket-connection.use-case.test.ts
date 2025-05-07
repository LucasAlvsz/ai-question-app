import { WebSocketService } from "@/services/web-socket.service";
import { RemoveWebSocketConnectionUseCase } from "@/use-cases/remove-web-socket-connection.use-case";

const mockDeleteConnection = jest.fn();

const mockWebSocketService: WebSocketService = {
  deleteConnection: mockDeleteConnection,
} as unknown as WebSocketService;

describe("RemoveWebSocketConnectionUseCase", () => {
  const useCase = new RemoveWebSocketConnectionUseCase(mockWebSocketService);

  const connectionId = "conn-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call deleteConnection with the given connectionId", async () => {
    await useCase.execute(connectionId);

    expect(mockDeleteConnection).toHaveBeenCalledWith("conn-123");
  });
});
