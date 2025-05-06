import { SNSEvent } from "aws-lambda";
import { answerQuestionUseCase } from "@/modules/answer-question.module";
import { Logger } from "@/shared/logging/logger";
import { PendingQuestionSchema } from "@/validations/pending-question.schema";

const logger = new Logger("AnswerProcessor");

export const handler = async (event: SNSEvent) => {
  try {
    logger.info("Received event:", JSON.parse(event.Records[0].Sns.Message));
    const record = event.Records[0];
    const validatedMessage = PendingQuestionSchema.parse(JSON.parse(record.Sns.Message));

    await answerQuestionUseCase.execute(validatedMessage);
  } catch (error) {
    logger.error("Error processing answer", error);
  }
};
