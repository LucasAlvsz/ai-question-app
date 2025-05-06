import { Runtime } from "aws-cdk-lib/aws-lambda";

const DEFAULT_LAMBDA_RUNTIME = Runtime.NODEJS_22_X;

export const LAMBDA_RESOURCES = {
  QUESTION_SUBMITTER: {
    id: "QuestionSubmitter",
    entry: "app/lambdas/question-submitter/index.ts",
    handler: "handler",
    runtime: DEFAULT_LAMBDA_RUNTIME,
  },
  ANSWER_PROCESSOR: {
    id: "AnswerProcessor",
    entry: "app/lambdas/answer-processor/index.ts",
    handler: "handler",
    runtime: DEFAULT_LAMBDA_RUNTIME,
    timeout: 15,
    envParams: {
      HUGGINGFACE_API_KEY: { path: "/ai/huggingface/api-key", secure: true },
      HUGGINGFACE_API_URL: { path: "/ai/huggingface/api-url", secure: false },
      HUGGINGFACE_MODEL: { path: "/ai/huggingface/model", secure: false },
      HUGGINGFACE_API_ROLE: { path: "/ai/huggingface/api-role", secure: false },
    },
  },
} as const;
