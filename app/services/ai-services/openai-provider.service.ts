import { AIProvider } from "./ai-provider.interface";

export class OpenAIProvider implements AIProvider {
  async generateAnswer(question: string): Promise<string> {
    try {
      return `This is a mock answer from OpenAIProvider for the question: ${question}`;
    } catch (error) {
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }
}
