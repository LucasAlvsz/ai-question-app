import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { DYNAMO_TABLES_RESOURCES } from "../constants/dynamo";

import { SNS_RESOURCES } from "../constants/sns";

export class SharedInfraStack extends cdk.Stack {
  questionsTable: dynamodb.Table;
  questionSubmittedTopic: sns.Topic;
  questionAnsweredTopic: sns.Topic;
}

export class SharedStack extends cdk.Stack {
  public readonly questionsTable: dynamodb.Table;
  public readonly questionSubmittedTopic: sns.Topic;
  public readonly questionAnsweredTopic: sns.Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.questionsTable = new dynamodb.Table(this, DYNAMO_TABLES_RESOURCES.QUESTIONS.id, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "timestamp", type: dynamodb.AttributeType.NUMBER },
      tableName: DYNAMO_TABLES_RESOURCES.QUESTIONS.name,
      billingMode: DYNAMO_TABLES_RESOURCES.QUESTIONS.billingMode,
      removalPolicy: DYNAMO_TABLES_RESOURCES.QUESTIONS.removalPolicy,
    });

    this.questionSubmittedTopic = new sns.Topic(this, SNS_RESOURCES.QUESTION_SUBMITTED.id, {
      topicName: SNS_RESOURCES.QUESTION_SUBMITTED.name,
      displayName: SNS_RESOURCES.QUESTION_SUBMITTED.displayName,
    });

    this.questionAnsweredTopic = new sns.Topic(this, SNS_RESOURCES.QUESTION_ANSWERED.id, {
      topicName: SNS_RESOURCES.QUESTION_ANSWERED.name,
      displayName: SNS_RESOURCES.QUESTION_ANSWERED.displayName,
    });
  }
}
