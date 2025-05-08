import { SNSEvent } from "aws-lambda";
import { SnsEventMap } from "@/events/sns-events-map";
import { notifyUserUseCase } from "@/modules/web-socket.module";
import { Logger } from "@/shared/logging/logger";

const logger = new Logger("HandleNotifyUser");

export const handleNotifyUser = async (event: SNSEvent) => {
  logger.info("Received event:", JSON.stringify(event, null, 2));

  const snsMessage = event.Records[0].Sns.Message;
  const parsedMessage = JSON.parse(snsMessage) as SnsEventMap["AnswerReady"];

  try {
    await notifyUserUseCase.execute({
      userId: parsedMessage.question.userId,
      payload: parsedMessage,
    });

    logger.info("User notified successfully", parsedMessage);
  } catch (error) {
    await notifyUserUseCase.execute({
      userId: parsedMessage.question.userId,
      payload: {
        question: {
          ...parsedMessage.question,
          answer: "Error processing answer",
        },
      },
    });

    logger.error("Error processing SNS event:", error);
    throw new Error("Error processing SNS event");
  }
};
