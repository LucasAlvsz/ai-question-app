import * as cdk from "aws-cdk-lib";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { APIGW_RESOURCES } from "../constants/api-gateway";
import { DYNAMO_TABLES_RESOURCES } from "../constants/dynamo";
import { LAMBDA_RESOURCES } from "../constants/lambdas";
import {
  resolveEnvironmentParameters,
  grantReadAccessToParameters,
} from "../helpers/ssm-parameters";

export interface NotifyUserStackProps extends cdk.StackProps {
  questionAnsweredTopic: sns.ITopic;
}

export class NotifyUserStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NotifyUserStackProps) {
    super(scope, id, props);

    const { questionAnsweredTopic } = props;

    const connectionsTable = new dynamodb.Table(this, DYNAMO_TABLES_RESOURCES.CONNECTIONS.id, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: DYNAMO_TABLES_RESOURCES.CONNECTIONS.tableName,
      billingMode: DYNAMO_TABLES_RESOURCES.CONNECTIONS.billingMode,
      removalPolicy: DYNAMO_TABLES_RESOURCES.CONNECTIONS.removalPolicy,
    });

    connectionsTable.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const { env: notifyUserEnvs, parameters: notifyUserParameters } = resolveEnvironmentParameters(
      this,
      LAMBDA_RESOURCES.NOTIFY_USER.envParams,
    );

    const notifyUser = new NodejsFunction(this, LAMBDA_RESOURCES.NOTIFY_USER.id, {
      runtime: LAMBDA_RESOURCES.NOTIFY_USER.runtime,
      entry: LAMBDA_RESOURCES.NOTIFY_USER.entry,
      handler: LAMBDA_RESOURCES.NOTIFY_USER.handler,
      timeout: cdk.Duration.seconds(LAMBDA_RESOURCES.NOTIFY_USER.timeout),
      environment: {
        SNS_TOPIC_ARN: questionAnsweredTopic.topicArn,
        CONNECTIONS_TABLE: connectionsTable.tableName,
        ...notifyUserEnvs,
      },
    });

    connectionsTable.grantReadWriteData(notifyUser);

    questionAnsweredTopic.grantPublish(notifyUser);
    grantReadAccessToParameters(notifyUser, notifyUserParameters);
    notifyUser.addEventSource(new SnsEventSource(questionAnsweredTopic));

    const webSocketApi = new WebSocketApi(this, APIGW_RESOURCES.WEBSOCKET_API.id, {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          APIGW_RESOURCES.WEBSOCKET_API.connectRouteOptions.integration.id,
          notifyUser,
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          APIGW_RESOURCES.WEBSOCKET_API.disconnectRouteOptions.integration.id,
          notifyUser,
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          APIGW_RESOURCES.WEBSOCKET_API.defaultRouteOptions.integration.id,
          notifyUser,
        ),
      },
    });

    webSocketApi.addRoute(APIGW_RESOURCES.WEBSOCKET_API.SUBSCRIBE_ROUTES.SUBSCRIBE.id, {
      integration: new WebSocketLambdaIntegration(
        APIGW_RESOURCES.WEBSOCKET_API.SUBSCRIBE_ROUTES.SUBSCRIBE.integration.id,
        notifyUser,
      ),
    });

    const webSocketStage = new WebSocketStage(this, APIGW_RESOURCES.WEBSOCKET_API.STAGE.id, {
      webSocketApi,
      autoDeploy: APIGW_RESOURCES.WEBSOCKET_API.STAGE.autoDeploy,
      stageName: APIGW_RESOURCES.WEBSOCKET_API.STAGE.name,
    });
    webSocketStage.node.addDependency(webSocketApi);

    const WebSocketEndpoint = `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${APIGW_RESOURCES.WEBSOCKET_API.STAGE.name}`;
    notifyUser.addEnvironment("WEBSOCKET_ENDPOINT", WebSocketEndpoint);

    notifyUser.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["execute-api:ManageConnections"],
        resources: [
          `arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:${webSocketApi.apiId}/${APIGW_RESOURCES.WEBSOCKET_API.STAGE.name}/*/@connections/*`,
        ],
        effect: cdk.aws_iam.Effect.ALLOW,
      }),
    );
  }
}
