import { DeleteItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { WebSocketConnectionRepository } from "./web-socket-connection.repository";
import { WebSocketConnection } from "@/entities/web-socket-connection";
import { dynamoDBClient } from "@/shared/aws/clients/dynamo";

export class DynamoWebSocketConnectionRepository implements WebSocketConnectionRepository {
  private readonly tableName = process.env.CONNECTIONS_TABLE;

  async save(connection: WebSocketConnection) {
    await dynamoDBClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: {
          id: { S: connection.id },
          userId: { S: connection.userId },
        },
      }),
    );
  }

  async getByUserId(userId: string) {
    const result = await dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": { S: userId },
        },
      }),
    );
    return (
      result.Items?.map((item) => ({
        id: item.id.S!,
        userId: item.userId.S!,
      })) ?? null
    );
  }

  async delete(connectionId: string) {
    await dynamoDBClient.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: {
          id: { S: connectionId },
        },
      }),
    );
  }
}
