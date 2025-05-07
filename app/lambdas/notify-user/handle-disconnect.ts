import { APIGatewayProxyEvent } from "aws-lambda";
import { removeConnectionUseCase } from "@/modules/web-socket.module";
import { Logger } from "@/shared/logging/logger";

const logger = new Logger("HandleDisconnect");

export const handleDisconnect = async (event: APIGatewayProxyEvent) => {
  logger.info("Received event:", JSON.stringify(event, null, 2));
  try {
    const { connectionId } = event.requestContext;

    await removeConnectionUseCase.execute(connectionId!);

    logger.info("WebSocket connection removed:", {
      connectionId,
    });
  } catch (error) {
    logger.error("Error handling disconnect:", error);
    throw new Error("Error handling disconnect");
  }
};
