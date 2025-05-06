import { AIProviderType } from "./ai-provider-type";
import { AIProvider } from "./ai-provider.interface";
import { HuggingFaceProvider } from "./huggingface-provider.service";
import { OpenAIProvider } from "./openai-provider.service";

const providerMap: Record<AIProviderType, () => AIProvider> = {
  [AIProviderType.OPENAI]: () => new OpenAIProvider(),
  [AIProviderType.HUGGINGFACE]: () => new HuggingFaceProvider(),
};

export class AIProviderFactory {
  static create(type: AIProviderType): AIProvider {
    const factory = providerMap[type];
    if (!factory) {
      throw new Error(`Unsupported AI provider: ${type}`);
    }
    return factory();
  }
}
