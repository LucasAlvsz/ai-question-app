import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";

import { Construct } from "constructs";

import { ENV_VARS } from "../../config/envs";
import { APIGW_RESOURCES } from "../constants/api-gateway";
import { LAMBDA_RESOURCES } from "../constants/lambdas";

interface QuestionStackProps extends cdk.StackProps {
  questionsTable: dynamodb.ITable;
  questionSubmittedTopic: sns.ITopic;
}
export class QuestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: QuestionStackProps) {
    super(scope, id, props);

    const { questionsTable, questionSubmittedTopic } = props;

    const questionHandler = new NodejsFunction(this, LAMBDA_RESOURCES.QUESTION_HANDLER.id, {
      runtime: LAMBDA_RESOURCES.QUESTION_HANDLER.runtime,
      entry: LAMBDA_RESOURCES.QUESTION_HANDLER.entry,
      handler: LAMBDA_RESOURCES.QUESTION_HANDLER.handler,
      timeout: cdk.Duration.seconds(LAMBDA_RESOURCES.QUESTION_HANDLER.timeout),
      environment: {
        QUESTIONS_TABLE: questionsTable.tableName,
        SNS_TOPIC_ARN: questionSubmittedTopic.topicArn,
      },
    });

    questionsTable.grantReadWriteData(questionHandler);
    questionSubmittedTopic.grantPublish(questionHandler);

    const restApi = new apigateway.LambdaRestApi(this, APIGW_RESOURCES.REST_API.id, {
      handler: questionHandler,
      proxy: false,
      deployOptions: {
        stageName: ENV_VARS.STAGE,
      },
    });

    const questionsResource = restApi.root.addResource("questions");
    questionsResource.addMethod("POST");
    questionsResource.addMethod("GET");
  }
}
