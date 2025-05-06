import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { ENV_VARS } from "../../config/envs";

const questionsTableSchema = {
  attributeDefinitions: [
    { attributeName: "id", attributeType: "S" },
    { attributeName: "timestamp", attributeType: "N" },
  ],
  keySchema: [
    { attributeName: "id", keyType: "HASH" },
    { attributeName: "timestamp", keyType: "RANGE" },
  ],
  partitionKey: {
    name: "id",
    type: "S",
  },
  sortKey: {
    name: "timestamp",
    type: "N",
  },
};

export const DYNAMO_TABLES_RESOURCES = {
  QUESTIONS: {
    id: "QuestionsTable",
    name: "questions",
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: ENV_VARS.STAGE === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    ...questionsTableSchema,
  },
} as const;
