export const ENV_VARS = {
  STAGE: process.env.STAGE || "dev",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
} as const;
