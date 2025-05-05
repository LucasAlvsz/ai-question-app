import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

export const DYNAMO_TABLES_RESOURCES = {
  QUESTIONS: {
    id: "QuestionsTable",
    name: "questions",
    billingMode: BillingMode.PAY_PER_REQUEST,
  },
} as const;
