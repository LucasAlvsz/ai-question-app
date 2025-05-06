import { APIGatewayProxyEvent } from "aws-lambda";
import { ZodError } from "zod";

import { submitQuestionUseCase } from "@/modules/question-submit.module";
import { Logger } from "@/shared/logging/logger";
import { SubmitQuestionSchema } from "@/validations/submit-question.schema";

const logger = new Logger("SubmitQuestionHandler");

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    logger.info("Received event:", JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body || "{}");
    const validatedBody = SubmitQuestionSchema.parse(body);

    await submitQuestionUseCase.execute(validatedBody);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Question submitted successfully",
      }),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid input",
          details: error.errors,
        }),
      };
    }

    logger.error("Error submitting question", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
