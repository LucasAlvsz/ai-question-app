import { APIGatewayProxyEvent } from "aws-lambda";
import { ZodError } from "zod";

import {
  listAnsweredQuestionsUseCase,
  submitQuestionUseCase,
} from "@/modules/question-handler.module";
import { Logger } from "@/shared/logging/logger";
import { SubmitQuestionSchema } from "@/validations/submit-question.schema";

const logger = new Logger("QuestionHandler");

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (event.httpMethod === "GET") {
      logger.info("Received event:", JSON.stringify(event, null, 2));

      const userId = event.queryStringParameters?.userId;
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Missing userId query parameter",
          }),
        };
      }

      const answeredQuestions = await listAnsweredQuestionsUseCase.execute(userId);

      logger.info("Answered questions retrieved successfully", answeredQuestions);

      return {
        statusCode: 200,
        body: JSON.stringify(answeredQuestions),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }
    if (event.httpMethod === "POST") {
      logger.info("Received event:", JSON.stringify(event, null, 2));
      const body = JSON.parse(event.body || "{}");
      const validatedBody = SubmitQuestionSchema.parse(body);

      await submitQuestionUseCase.execute(validatedBody);

      logger.info("Question submitted successfully", validatedBody);
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Question submitted successfully",
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method not allowed",
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
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

    logger.error("Error handling event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
