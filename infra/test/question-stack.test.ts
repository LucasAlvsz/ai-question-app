import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";

import { DYNAMO_TABLES_RESOURCES } from "../constants/dynamo";
import { LAMBDA_RESOURCES } from "../constants/lambdas";
import { SNS_RESOURCES } from "../constants/sns";
import { QuestionStack } from "../stacks/question-stack";

describe("QuestionStack", () => {
  const app = new cdk.App();
  const stack = new QuestionStack(app, "TestStack");

  const template = Template.fromStack(stack);

  it("should create a DynamoDB table with correct properties", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: DYNAMO_TABLES_RESOURCES.QUESTIONS.name,
      BillingMode: DYNAMO_TABLES_RESOURCES.QUESTIONS.billingMode,
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
    });
  });

  it("should create an SNS topic with the correct name", () => {
    template.hasResourceProperties("AWS::SNS::Topic", {
      TopicName: SNS_RESOURCES.QUESTION_SUBMITTED.name,
      DisplayName: SNS_RESOURCES.QUESTION_SUBMITTED.displayName,
    });
  });

  it("should create a Lambda function with required environment variables", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: LAMBDA_RESOURCES.QUESTION_SUBMITTER.runtime.name,
      Handler: "index.handler",
      Environment: {
        Variables: Match.objectLike({
          QUESTIONS_TABLE: Match.anyValue(),
          SNS_TOPIC_ARN: Match.anyValue(),
        }),
      },
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

  it("should create an API Gateway resource with POST method", () => {
    template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
    template.resourceCountIs("AWS::ApiGateway::Method", 1);
    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "POST",
    });
  });
});
