import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";

import { ENV_VARS } from "../../config/envs";
import { APIGW_RESOURCES } from "../constants/api-gateway";
import { DYNAMO_TABLES_RESOURCES } from "../constants/dynamo";
import { LAMBDA_RESOURCES } from "../constants/lambdas";
import { SNS_RESOURCES } from "../constants/sns";

export class QuestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const questionsTable = new dynamodb.Table(this, DYNAMO_TABLES_RESOURCES.QUESTIONS.id, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: DYNAMO_TABLES_RESOURCES.QUESTIONS.name,
      billingMode: DYNAMO_TABLES_RESOURCES.QUESTIONS.billingMode,
    });

    const questionSubmittedTopic = new sns.Topic(this, SNS_RESOURCES.QUESTION_SUBMITTED.id, {
      displayName: SNS_RESOURCES.QUESTION_SUBMITTED.displayName,
      topicName: SNS_RESOURCES.QUESTION_SUBMITTED.name,
    });

    const questionSubmitter = new NodejsFunction(this, LAMBDA_RESOURCES.QUESTION_SUBMITTER.id, {
      runtime: LAMBDA_RESOURCES.QUESTION_SUBMITTER.runtime,
      entry: LAMBDA_RESOURCES.QUESTION_SUBMITTER.entry,
      handler: LAMBDA_RESOURCES.QUESTION_SUBMITTER.handler,
      environment: {
        QUESTIONS_TABLE: questionsTable.tableName,
        SNS_TOPIC_ARN: questionSubmittedTopic.topicArn,
      },
    });

    questionsTable.grantReadWriteData(questionSubmitter);
    questionSubmittedTopic.grantPublish(questionSubmitter);

    const restApi = new apigateway.LambdaRestApi(this, APIGW_RESOURCES.REST_API.id, {
      handler: questionSubmitter,
      proxy: false,
      deployOptions: {
        stageName: ENV_VARS.STAGE,
      },
    });

    const questionsResource = restApi.root.addResource("questions");
    questionsResource.addMethod("POST");
  }
}
