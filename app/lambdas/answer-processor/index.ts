import { SNSEvent } from "aws-lambda";
import { answerQuestionUseCase } from "@/modules/answer-processor.module";
import { Logger } from "@/shared/logging/logger";
import { PendingQuestionSchema } from "@/validations/pending-question.schema";

const logger = new Logger("AnswerProcessor");

export const handler = async (event: SNSEvent) => {
  try {
    logger.info("Received event:", JSON.stringify(event, null, 2));
    logger.info("Processing answer: ", event.Records[0].Sns.Message);
    const record = event.Records[0];
    const validatedMessage = PendingQuestionSchema.parse(JSON.parse(record.Sns.Message));

    await answerQuestionUseCase.execute(validatedMessage);

    logger.info("Answer processed successfully");
  } catch (error) {
    logger.error("Error processing answer", error);
  }
};
