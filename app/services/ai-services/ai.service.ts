import { AIProviderFactory } from "./ai-provider-factory";
import { AIProviderType } from "./ai-provider-type";

export class AIService {
  async generateAnswer(question: string, providerType: AIProviderType): Promise<string> {
    const provider = AIProviderFactory.create(providerType);
    return provider.generateAnswer(question);
  }
}
