import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";

import { DYNAMO_TABLES_RESOURCES } from "../../constants/dynamo";
import { LAMBDA_RESOURCES } from "../../constants/lambdas";
import { SNS_RESOURCES } from "../../constants/sns";
import { QuestionStack } from "../../stacks/question-stack";

describe("QuestionStack", () => {
  const app = new cdk.App();
  const mockStack = new cdk.Stack(app, "MockStack");

  const fakeTable = dynamodb.Table.fromTableName(
    mockStack,
    "FakeQuestionsTable",
    DYNAMO_TABLES_RESOURCES.QUESTIONS.tableName,
  );

  const fakeTopic = sns.Topic.fromTopicArn(
    mockStack,
    "FakeQuestionSubmittedTopic",
    `arn:aws:sns:us-east-1:123456789012:${SNS_RESOURCES.QUESTION_SUBMITTED.name}`,
  );

  const stack = new QuestionStack(app, "TestStack", {
    questionsTable: fakeTable,
    questionSubmittedTopic: fakeTopic,
  });

  const template = Template.fromStack(stack);

  it("should create a Lambda function with required environment variables", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: LAMBDA_RESOURCES.QUESTION_HANDLER.runtime.name,
      Handler: "index.handler",
      Environment: {
        Variables: Match.objectLike({
          QUESTIONS_TABLE: Match.anyValue(),
          SNS_TOPIC_ARN: Match.anyValue(),
        }),
      },
    });
  });

  it("should attach IAM policy to Lambda with permissions to write to DynamoDB questions table", () => {
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

  it("should attach IAM policy to Lambda with permissions to publish to SNS question submitted topic", () => {
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

  it("should create an API Gateway resource with correct methods", () => {
    template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
    template.resourceCountIs("AWS::ApiGateway::Method", 3);
    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "POST",
    });
    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "GET",
    });
    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "OPTIONS",
    });
  });
});
