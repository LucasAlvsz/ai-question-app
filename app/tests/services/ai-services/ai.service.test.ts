// app/tests/services/ai.service.test.ts

import { AIProviderFactory } from "@/services/ai-services/ai-provider-factory";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { AIService } from "@/services/ai-services/ai.service";

jest.mock("@/services/ai-services/ai-provider-factory");

describe("AIService", () => {
  const question = "Qual é a capital da França?";
  const mockAnswer = "Paris";
  const mockGenerateAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate answer using the specified provider", async () => {
    (AIProviderFactory.create as jest.Mock).mockReturnValue({
      generateAnswer: mockGenerateAnswer.mockResolvedValue(mockAnswer),
    });

    const service = new AIService();
    const result = await service.generateAnswer(question, AIProviderType.OPENAI);

    expect(AIProviderFactory.create).toHaveBeenCalledWith(AIProviderType.OPENAI);
    expect(mockGenerateAnswer).toHaveBeenCalledWith(question);
    expect(result).toBe(mockAnswer);
  });

  it("should throw error if provider fails", async () => {
    const error = new Error("Failed to generate answer");
    (AIProviderFactory.create as jest.Mock).mockReturnValue({
      generateAnswer: jest.fn().mockRejectedValue(error),
    });

    const service = new AIService();

    await expect(service.generateAnswer(question, AIProviderType.OPENAI)).rejects.toThrow(
      "Failed to generate answer",
    );
  });
});
