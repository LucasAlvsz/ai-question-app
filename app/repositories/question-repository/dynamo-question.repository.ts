import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

import { buildUpdateExpression } from "./dynamo.helpers";
import { QuestionRepository } from "./question.repository";
import { Question } from "@/entities/question";
import { dynamoDBClient } from "@/shared/aws/clients/dynamo";

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

  async update(question: Partial<Question> & { id: string; timestamp: number }) {
    const { id, timestamp, ...fields } = question;
    const { ExpressionAttributeNames, ExpressionAttributeValues, UpdateExpression } =
      buildUpdateExpression(fields);
    await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: {
          id: { S: id },
          timestamp: { N: String(timestamp) },
        },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      }),
    );
  }
}
