// app/tests/use-cases/answer-question.use-case.test.ts

import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { AIService } from "@/services/ai-services/ai.service";
import { QuestionService } from "@/services/question.service";
import { AnswerQuestionUseCase } from "@/use-cases/answer-question.usecase";

const mockGenerateAnswer = jest.fn();
const mockUpdateQuestionWithAnswer = jest.fn();
const mockNotifyQuestionAnswered = jest.fn();

const mockAIService: AIService = {
  generateAnswer: mockGenerateAnswer,
} as unknown as AIService;

const mockQuestionService: QuestionService = {
  updateQuestionWithAnswer: mockUpdateQuestionWithAnswer,
  notifyQuestionAnswered: mockNotifyQuestionAnswered,
} as unknown as QuestionService;

describe("AnswerQuestionUseCase", () => {
  const useCase = new AnswerQuestionUseCase(mockAIService, mockQuestionService);

  const pendingQuestionData = {
    question: {
      id: "q-1",
      content: "Qual é a capital da França?",
      timestamp: Date.now(),
      userId: "user-123",
      status: "PENDING" as const,
    },
    provider: AIProviderType.OPENAI,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate answer, update question, and notify", async () => {
    const mockAnswer = "Paris";

    mockGenerateAnswer.mockResolvedValue(mockAnswer);

    await useCase.execute(pendingQuestionData);

    expect(mockGenerateAnswer).toHaveBeenCalledWith(
      pendingQuestionData.question.content,
      pendingQuestionData.provider,
    );

    expect(mockUpdateQuestionWithAnswer).toHaveBeenCalledWith({
      id: pendingQuestionData.question.id,
      answer: mockAnswer,
      status: "ANSWERED",
      timestamp: pendingQuestionData.question.timestamp,
    });

    expect(mockNotifyQuestionAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        id: pendingQuestionData.question.id,
        content: pendingQuestionData.question.content,
        answer: mockAnswer,
        status: "ANSWERED",
        timestamp: pendingQuestionData.question.timestamp,
      }),
    );
  });
});
