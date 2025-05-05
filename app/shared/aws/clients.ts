import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";

import { ENV_VARS } from "../../../config/envs";

const dynamoDBClient = new DynamoDBClient({ region: ENV_VARS.AWS_REGION });
const snsClient = new SNSClient({ region: ENV_VARS.AWS_REGION });

export { dynamoDBClient, snsClient };
