import { SNSClient } from "@aws-sdk/client-sns";
import { ENV_VARS } from "config/envs";

export const snsClient = new SNSClient({ region: ENV_VARS.AWS_REGION });
