import { AIProvider } from "./ai-provider.interface";
import { ENV_VARS } from "@/app-config/envs";
import { getSecret } from "@/shared/aws/ssm";

type HuggingFaceResponse = {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
};

export class HuggingFaceProvider implements AIProvider {
  private async getHuggingFaceSecrets() {
    const [apiKey] = await Promise.all([getSecret(ENV_VARS.HUGGINGFACE_API_KEY!)]);

    return { apiKey };
  }
  async generateAnswer(question: string): Promise<string> {
    try {
      const { apiKey } = await this.getHuggingFaceSecrets();

      const response = await fetch(ENV_VARS.HUGGINGFACE_API_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: ENV_VARS.HUGGINGFACE_API_ROLE,
              content: question,
            },
          ],
          model: ENV_VARS.HUGGINGFACE_MODEL,
        }),
      });
      const data = (await response.json()) as HuggingFaceResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No choices returned from HuggingFace API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }
}
