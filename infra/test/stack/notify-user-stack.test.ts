import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as sns from "aws-cdk-lib/aws-sns";

import { APIGW_RESOURCES } from "../../constants/api-gateway";
import { DYNAMO_TABLES_RESOURCES } from "../../constants/dynamo";
import { SNS_RESOURCES } from "../../constants/sns";
import { NotifyUserStack } from "../../stacks/notify-user-stack";

describe("NotifyUserStack", () => {
  const app = new cdk.App();
  const mockStack = new cdk.Stack(app, "MockStack");

  const fakeTopic = sns.Topic.fromTopicArn(
    mockStack,
    "FakeTopic",
    `arn:aws:sns:us-east-1:123456789012:${SNS_RESOURCES.QUESTION_ANSWERED.name}`,
  );

  const stack = new NotifyUserStack(app, "TestStack", {
    questionAnsweredTopic: fakeTopic,
  });

  const template = Template.fromStack(stack);

  it("should create the connections DynamoDB table with GSI", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: DYNAMO_TABLES_RESOURCES.CONNECTIONS.tableName,
      KeySchema: Match.arrayWith([Match.objectLike({ AttributeName: "id", KeyType: "HASH" })]),
      AttributeDefinitions: Match.arrayWith([
        Match.objectLike({ AttributeName: "id", AttributeType: "S" }),
        Match.objectLike({ AttributeName: "userId", AttributeType: "S" }),
      ]),
      BillingMode: DYNAMO_TABLES_RESOURCES.CONNECTIONS.billingMode,
    });
  });

  it("should create the notifyUser Lambda with expected environment variables", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs22.x",
      Timeout: 15,
      Environment: {
        Variables: Match.objectLike({
          SNS_TOPIC_ARN: Match.anyValue(),
          CONNECTIONS_TABLE: Match.anyValue(),
          WEBSOCKET_ENDPOINT: Match.anyValue(),
        }),
      },
    });
  });

  it("should create a WebSocket API and stage", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      Name: APIGW_RESOURCES.WEBSOCKET_API.id,
      ProtocolType: "WEBSOCKET",
    });

    template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
      StageName: APIGW_RESOURCES.WEBSOCKET_API.STAGE.name,
      AutoDeploy: APIGW_RESOURCES.WEBSOCKET_API.STAGE.autoDeploy,
    });
  });

  it("should create an SNS subscription for the Lambda", () => {
    template.resourceCountIs("AWS::SNS::Subscription", 1);
    template.hasResourceProperties("AWS::SNS::Subscription", {
      Protocol: "lambda",
      Endpoint: Match.anyValue(),
    });
  });
});
