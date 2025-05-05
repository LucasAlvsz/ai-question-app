import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { ENV_VARS } from "../../config/envs";

export const DYNAMO_TABLES_RESOURCES = {
  QUESTIONS: {
    id: "QuestionsTable",
    name: "questions",
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: ENV_VARS.STAGE === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
  },
} as const;
