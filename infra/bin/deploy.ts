#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { QuestionStack } from "../stacks/question-stack";

const app = new cdk.App();

new QuestionStack(app, "QuestionStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

app.synth();
