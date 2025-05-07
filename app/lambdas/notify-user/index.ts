import { APIGatewayProxyEvent, SNSEvent } from "aws-lambda";
import { handleDisconnect } from "./handle-disconnect";
import { handleNotifyUser } from "./handle-notify-user";
import { handleSubscribe } from "./handle-subscribe";
import { Logger } from "@/shared/logging/logger";

const logger = new Logger("NotifyUserIndexHandler");

export const handler = async (
  event: APIGatewayProxyEvent | SNSEvent,
): Promise<{
  statusCode: number;
  body: string;
}> => {
  if ("requestContext" in event && event.requestContext.routeKey === "$connect") {
    return {
      statusCode: 200,
      body: "Connected",
    };
  }

  if ("requestContext" in event && event.requestContext.routeKey === "$disconnect") {
    try {
      await handleDisconnect(event);
    } catch (error) {
      logger.error("Error handling disconnect:", error);
      return {
        statusCode: 500,
        body: "Error handling disconnect",
      };
    }
    return {
      statusCode: 200,
      body: "Disconnected",
    };
  }

  if ("requestContext" in event && event.requestContext.routeKey === "subscribe") {
    try {
      await handleSubscribe(event);

      return {
        statusCode: 200,
        body: "Subscribed",
      };
    } catch (error) {
      logger.error("Error handling subscribe:", error);
      return {
        statusCode: 500,
        body: "Error handling subscribe",
      };
    }
  }

  if ("Records" in event && event.Records[0].EventSource === "aws:sns") {
    try {
      await handleNotifyUser(event);
      return {
        statusCode: 200,
        body: "Notification sent",
      };
    } catch (err) {
      logger.error("Error processing SNS event:", err);
      return {
        statusCode: 500,
        body: "Internal server error",
      };
    }
  }

  logger.info("Received event:", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: "Event ignored",
  };
};
