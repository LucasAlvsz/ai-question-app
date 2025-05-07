import { APIGatewayProxyEvent } from "aws-lambda";
import { registerConnectionUseCase } from "@/modules/web-socket.module";
import { Logger } from "@/shared/logging/logger";

const logger = new Logger("HandleSubscribe");

export const handleSubscribe = async (event: APIGatewayProxyEvent) => {
  logger.info("Received event:", JSON.stringify(event, null, 2));
  try {
    const { connectionId } = event.requestContext;

    const { userId } = JSON.parse(event.body ?? "{}");
    if (!userId) {
      return { statusCode: 400, body: "Missing userId" };
    }

    await registerConnectionUseCase.execute({
      id: connectionId!,
      userId,
    });

    logger.info("WebSocket connection registered:", {
      connectionId,
      userId,
    });
    return;
  } catch (error) {
    logger.error("Error handling request context:", error);
    throw new Error("Error handling request context");
  }
};
