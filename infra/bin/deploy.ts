#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AnswerStack } from "../stacks/answer-stack";
import { QuestionStack } from "../stacks/question-stack";
import { SharedStack } from "../stacks/shared-stack";

const app = new cdk.App();

const shared = new SharedStack(app, "SharedStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new QuestionStack(app, "QuestionStack", {
  questionsTable: shared.questionsTable,
  questionSubmittedTopic: shared.questionSubmittedTopic,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new AnswerStack(app, "AnswerStack", {
  questionsTable: shared.questionsTable,
  questionAnsweredTopic: shared.questionAnsweredTopic,
  questionSubmittedTopic: shared.questionSubmittedTopic,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

app.synth();
