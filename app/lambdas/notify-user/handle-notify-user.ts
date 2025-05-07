import { SNSEvent } from "aws-lambda";
import { SnsEventMap } from "@/events/sns-events-map";
import { notifyUserUseCase } from "@/modules/web-socket.module";
import { Logger } from "@/shared/logging/logger";

const logger = new Logger("HandleNotifyUser");

export const handleNotifyUser = async (event: SNSEvent) => {
  logger.info("Received event:", JSON.stringify(event, null, 2));

  try {
    const snsMessage = event.Records[0].Sns.Message;
    const parsedMessage = JSON.parse(snsMessage) as SnsEventMap["AnswerReady"];

    await notifyUserUseCase.execute({
      userId: parsedMessage.question.userId,
      payload: parsedMessage,
    });

    logger.info("User notified successfully", parsedMessage);
  } catch (error) {
    logger.error("Error processing SNS event:", error);
    throw new Error("Error processing SNS event");
  }
};
