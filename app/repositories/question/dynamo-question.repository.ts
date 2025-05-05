import { PutItemCommand } from "@aws-sdk/client-dynamodb";

import { QuestionRepository } from "./question.repository";
import { Question } from "@/entities/question";
import { dynamoDBClient } from "@/shared/aws/clients";

export class DynamoQuestionRepository implements QuestionRepository {
  private readonly tableName = process.env.QUESTIONS_TABLE;

  async save(question: Question) {
    await dynamoDBClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: {
          id: { S: question.id },
          userId: { S: question.userId },
          content: { S: question.content },
          timestamp: { N: String(question.timestamp) },
          status: { S: question.status },
        },
      }),
    );
  }
}
