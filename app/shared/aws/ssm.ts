import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({});
const secretCache: Record<string, string> = {};

export const getSecret = async (name: string): Promise<string> => {
  if (secretCache[name]) {
    return secretCache[name];
  }

  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  const { Parameter } = await ssm.send(command);

  if (!Parameter?.Value) {
    throw new Error(`Secret not found: ${name}`);
  }

  secretCache[name] = Parameter.Value;
  return Parameter.Value;
};
