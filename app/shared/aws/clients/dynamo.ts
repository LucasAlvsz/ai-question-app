import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ENV_VARS } from "config/envs";

export const dynamoDBClient = new DynamoDBClient({ region: ENV_VARS.AWS_REGION });
