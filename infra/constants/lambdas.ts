import { Runtime } from "aws-cdk-lib/aws-lambda";

const DEFAULT_LAMBDA_RUNTIME = Runtime.NODEJS_22_X;

export const LAMBDA_RESOURCES = {
  QUESTION_SUBMITTER: {
    id: "QuestionSubmitter",
    entry: "app/lambdas/question-submitter/index.ts",
    handler: "handler",
    runtime: DEFAULT_LAMBDA_RUNTIME,
  },
} as const;
