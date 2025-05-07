import { DynamoWebSocketConnectionRepository } from "@/repositories/web-socket-connection-repository/dynamo-web-socket-connection.repository";
import { WebSocketService } from "@/services/web-socket.service";
import { NotifyUserUseCase } from "@/use-cases/notify-user.use-case";
import { RegisterConnectionUseCase } from "@/use-cases/register-web-socket-connection.use-case";
import { RemoveWebSocketConnectionUseCase } from "@/use-cases/remove-web-socket-connection.use-case";

const webSocketRepository = new DynamoWebSocketConnectionRepository();
const webSocketService = new WebSocketService(webSocketRepository);

const registerConnectionUseCase = new RegisterConnectionUseCase(webSocketService);
const notifyUserUseCase = new NotifyUserUseCase(webSocketService);
const removeConnectionUseCase = new RemoveWebSocketConnectionUseCase(webSocketService);

export { registerConnectionUseCase, notifyUserUseCase, removeConnectionUseCase };
