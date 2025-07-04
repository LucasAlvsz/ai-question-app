import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { DYNAMO_TABLES_RESOURCES } from "../../constants/dynamo";
import { SNS_RESOURCES } from "../../constants/sns";
import { SharedStack } from "../../stacks/shared-stack";

describe("SharedStack", () => {
  const app = new cdk.App();
  const stack = new SharedStack(app, "TestStack", {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  });

  const template = Template.fromStack(stack);

  it("should create a DynamoDB table with the correct properties", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: DYNAMO_TABLES_RESOURCES.QUESTIONS.tableName,
      BillingMode: DYNAMO_TABLES_RESOURCES.QUESTIONS.billingMode,
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
        {
          AttributeName: "timestamp",
          AttributeType: "N",
        },
        {
          AttributeName: "userId",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
        {
          AttributeName: "timestamp",
          KeyType: "RANGE",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: DYNAMO_TABLES_RESOURCES.QUESTIONS.globalSecondaryIndexes.UserIdIndex.indexName,
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
            {
              AttributeName: "timestamp",
              KeyType: "RANGE",
            },
          ],
        },
      ],
    });
  });

  it("should create a SNS topic for question submitted", () => {
    template.hasResourceProperties("AWS::SNS::Topic", {
      TopicName: SNS_RESOURCES.QUESTION_SUBMITTED.name,
      DisplayName: SNS_RESOURCES.QUESTION_SUBMITTED.displayName,
    });
  });

  it("should create a SNS topic for question answered", () => {
    template.hasResourceProperties("AWS::SNS::Topic", {
      TopicName: SNS_RESOURCES.QUESTION_ANSWERED.name,
      DisplayName: SNS_RESOURCES.QUESTION_ANSWERED.displayName,
    });
  });
});
