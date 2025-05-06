import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";

import { LAMBDA_RESOURCES } from "../../constants/lambdas";
import { SNS_RESOURCES } from "../../constants/sns";
import { AnswerStack } from "../../stacks/answer-stack";

jest.mock("../../helpers/ssm-parameters", () => ({
  resolveEnvironmentParameters: jest.fn().mockReturnValue({
    env: {
      HUGGINGFACE_API_KEY: "/ai/huggingface/api-key",
      HUGGINGFACE_API_URL: "https://mock.url",
      HUGGINGFACE_MODEL: "mock-model",
      HUGGINGFACE_API_ROLE: "mock-role",
    },
    parameters: {
      HUGGINGFACE_API_KEY: { grantRead: jest.fn() },
      HUGGINGFACE_API_URL: { grantRead: jest.fn() },
      HUGGINGFACE_MODEL: { grantRead: jest.fn() },
      HUGGINGFACE_API_ROLE: { grantRead: jest.fn() },
    },
  }),
  grantReadAccessToParameters: jest.fn(),
}));

describe("AnswerStack", () => {
  const app = new cdk.App();
  const mockStack = new cdk.Stack(app, "MockStack");

  const fakeTable = dynamodb.Table.fromTableName(mockStack, "FakeQuestionsTable", "questions");

  const fakeSubmittedTopic = sns.Topic.fromTopicArn(
    mockStack,
    "FakeQuestionSubmittedTopic",
    `arn:aws:sns:us-east-1:123456789012:${SNS_RESOURCES.QUESTION_SUBMITTED.name}`,
  );

  const fakeAnsweredTopic = sns.Topic.fromTopicArn(
    mockStack,
    "FakeQuestionAnsweredTopic",
    `arn:aws:sns:us-east-1:123456789012:${SNS_RESOURCES.QUESTION_ANSWERED.name}`,
  );

  const stack = new AnswerStack(app, "TestAnswerStack", {
    questionsTable: fakeTable,
    questionSubmittedTopic: fakeSubmittedTopic,
    questionAnsweredTopic: fakeAnsweredTopic,
  });

  const template = Template.fromStack(stack);

  it("should create a Lambda function with required environment variables", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: LAMBDA_RESOURCES.ANSWER_PROCESSOR.runtime.name,
      Handler: "index.handler",
      Environment: {
        Variables: Match.objectLike({
          QUESTIONS_TABLE: Match.anyValue(),
          SNS_TOPIC_ARN: Match.anyValue(),
          HUGGINGFACE_API_KEY: "/ai/huggingface/api-key",
          HUGGINGFACE_API_URL: "https://mock.url",
          HUGGINGFACE_MODEL: "mock-model",
          HUGGINGFACE_API_ROLE: "mock-role",
        }),
      },
    });
  });

  it("should attach IAM policy to Lambda with permissions to publish to SNS", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sns:Publish",
            Effect: "Allow",
          }),
        ]),
      }),
    });
  });

  it("should attach IAM policy to Lambda with permissions to write to DynamoDB", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(["dynamodb:PutItem"]),
            Effect: "Allow",
          }),
        ]),
      }),
    });
  });
});
