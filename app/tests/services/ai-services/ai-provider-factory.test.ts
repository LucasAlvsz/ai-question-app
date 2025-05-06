// app/tests/services/ai-provider-factory.test.ts

import { AIProviderFactory } from "@/services/ai-services/ai-provider-factory";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { HuggingFaceProvider } from "@/services/ai-services/huggingface-provider.service";
import { OpenAIProvider } from "@/services/ai-services/openai-provider.service";

describe("AIProviderFactory", () => {
  it("should create an OpenAIProvider instance", () => {
    const provider = AIProviderFactory.create(AIProviderType.OPENAI);
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("should create a HuggingFaceProvider instance", () => {
    const provider = AIProviderFactory.create(AIProviderType.HUGGINGFACE);
    expect(provider).toBeInstanceOf(HuggingFaceProvider);
  });

  it("should throw an error for unsupported provider type", () => {
    expect(() =>
      // @ts-expect-error — testing invalid enum
      AIProviderFactory.create("invalid-provider"),
    ).toThrow("Unsupported AI provider: invalid-provider");
  });
});
