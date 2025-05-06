import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { LAMBDA_RESOURCES } from "../constants/lambdas";
import {
  resolveEnvironmentParameters,
  grantReadAccessToParameters,
} from "../helpers/ssm-parameters";

interface AnswerStackProps extends cdk.StackProps {
  questionsTable: dynamodb.ITable;
  questionAnsweredTopic: sns.ITopic;
  questionSubmittedTopic: sns.ITopic;
}

export class AnswerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AnswerStackProps) {
    super(scope, id, props);

    const { questionsTable, questionAnsweredTopic, questionSubmittedTopic } = props;

    const { env: answerProcessorEnvs, parameters: answerProcessorParameters } =
      resolveEnvironmentParameters(this, LAMBDA_RESOURCES.ANSWER_PROCESSOR.envParams);

    const answerProcessor = new NodejsFunction(this, LAMBDA_RESOURCES.ANSWER_PROCESSOR.id, {
      runtime: LAMBDA_RESOURCES.ANSWER_PROCESSOR.runtime,
      entry: LAMBDA_RESOURCES.ANSWER_PROCESSOR.entry,
      handler: LAMBDA_RESOURCES.ANSWER_PROCESSOR.handler,
      timeout: cdk.Duration.seconds(LAMBDA_RESOURCES.ANSWER_PROCESSOR.timeout),
      environment: {
        QUESTIONS_TABLE: questionsTable.tableName,
        SNS_TOPIC_ARN: questionAnsweredTopic.topicArn,
        ...answerProcessorEnvs,
      },
    });

    questionsTable.grantReadWriteData(answerProcessor);
    questionAnsweredTopic.grantPublish(answerProcessor);
    grantReadAccessToParameters(answerProcessor, answerProcessorParameters);
    answerProcessor.addEventSource(new SnsEventSource(questionSubmittedTopic));
  }
}
