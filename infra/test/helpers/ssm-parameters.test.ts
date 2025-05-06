import { IGrantable } from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import {
  resolveEnvironmentParameters,
  grantReadAccessToParameters,
} from "../../helpers/ssm-parameters";

jest.mock("aws-cdk-lib/aws-ssm", () => ({
  StringParameter: {
    fromSecureStringParameterAttributes: jest.fn(),
    fromStringParameterAttributes: jest.fn(),
  },
}));

describe("SSMParameters", () => {
  const mockScope = {} as Construct;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should resolve secure and non-secure environment parameters correctly", () => {
    const mockSecureParam = {
      stringValue: "SECURE_PARAM_VALUE",
      grantRead: jest.fn(),
    };

    const mockPlainParam = {
      stringValue: "PLAIN_PARAM_VALUE",
      grantRead: jest.fn(),
    };

    (ssm.StringParameter.fromSecureStringParameterAttributes as jest.Mock).mockReturnValue(
      mockSecureParam,
    );
    (ssm.StringParameter.fromStringParameterAttributes as jest.Mock).mockReturnValue(
      mockPlainParam,
    );

    const parameters = {
      HUGGINGFACE_API_KEY: { path: "/ai/huggingface/api-key", secure: true },
      HUGGINGFACE_API_URL: { path: "/ai/huggingface/api-url", secure: false },
    };

    const { env, parameters: resolvedParams } = resolveEnvironmentParameters(mockScope, parameters);

    expect(env).toEqual({
      HUGGINGFACE_API_KEY: "/ai/huggingface/api-key",
      HUGGINGFACE_API_URL: "PLAIN_PARAM_VALUE",
    });

    expect(resolvedParams).toEqual({
      HUGGINGFACE_API_KEY: mockSecureParam,
      HUGGINGFACE_API_URL: mockPlainParam,
    });

    expect(ssm.StringParameter.fromSecureStringParameterAttributes).toHaveBeenCalledWith(
      mockScope,
      "HUGGINGFACE_API_KEYSecureParam",
      expect.objectContaining({ parameterName: "/ai/huggingface/api-key" }),
    );

    expect(ssm.StringParameter.fromStringParameterAttributes).toHaveBeenCalledWith(
      mockScope,
      "HUGGINGFACE_API_URLParam",
      expect.objectContaining({ parameterName: "/ai/huggingface/api-url" }),
    );
  });

  it("should call grantRead on each parameter", () => {
    const mockGrantRead = jest.fn();

    const mockParams = {
      PARAM1: { grantRead: mockGrantRead },
      PARAM2: { grantRead: mockGrantRead },
    } as unknown as Record<string, ssm.IStringParameter>;

    const grantee = {} as IGrantable;

    grantReadAccessToParameters(grantee, mockParams);

    expect(mockGrantRead).toHaveBeenCalledTimes(2);
    expect(mockGrantRead).toHaveBeenCalledWith(grantee);
  });
});
