import { IGrantable } from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

type ParameterConfig = {
  path: string;
  secure: boolean;
};

export const resolveEnvironmentParameters = (
  scope: Construct,
  parameters: Record<string, ParameterConfig>,
): { env: Record<string, string>; parameters: Record<string, ssm.IStringParameter> } => {
  return Object.entries(parameters).reduce(
    (acc, [envKey, { path, secure }]) => {
      const param = secure
        ? ssm.StringParameter.fromSecureStringParameterAttributes(scope, `${envKey}SecureParam`, {
            parameterName: path,
          })
        : ssm.StringParameter.fromStringParameterAttributes(scope, `${envKey}Param`, {
            parameterName: path,
          });

      acc.env[envKey] = secure ? path : param.stringValue;
      acc.parameters[envKey] = param;
      return acc;
    },
    { env: {}, parameters: {} } as {
      env: Record<string, string>;
      parameters: Record<string, ssm.IStringParameter>;
    },
  );
};

export const grantReadAccessToParameters = (
  grantee: IGrantable,
  parameters: Record<string, ssm.IStringParameter>,
) => {
  Object.values(parameters).forEach((param) => {
    param.grantRead(grantee);
  });
};
