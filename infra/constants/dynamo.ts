import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { ENV_VARS } from "../../config/envs";

export const DYNAMO_TABLES_RESOURCES = {
  QUESTIONS: {
    id: "QuestionsTable",
    tableName: "questions",
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: ENV_VARS.STAGE === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    globalSecondaryIndexes: {
      UserIdIndex: {
        indexName: "UserIdIndex",
      },
    },
  },

  CONNECTIONS: {
    id: "WebSocketConnectionsTable",
    tableName: "websocket-connections",
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: ENV_VARS.STAGE === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    globalSecondaryIndexes: {
      UserIdIndex: {
        indexName: "UserIdIndex",
      },
    },
  },
} as const;
