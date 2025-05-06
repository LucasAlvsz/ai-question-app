import { QuestionRepository } from "@/repositories/question-repository/question.repository";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";
import { SubmitQuestionUseCase } from "@/use-cases/submit-question.usecase";
import { SubmitQuestionData } from "@/validations/submit-question.schema";

describe("SubmitQuestionUseCase", () => {
  const mockSave = jest.fn();
  const mockPublish = jest.fn();
  const mockUpdate = jest.fn();

  const mockRepo: QuestionRepository = {
    save: mockSave,
    update: mockUpdate,
  };

  const mockSnsService = {
    publish: mockPublish,
  } as unknown as SnsService;

  const questionService = new QuestionService(mockRepo, mockSnsService);
  const useCase = new SubmitQuestionUseCase(questionService);

  const submitData: SubmitQuestionData = {
    question: {
      content: "Qual a capital do Brasil?",
      userId: "user-id-123",
    },
    provider: AIProviderType.HUGGINGFACE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a question and notify SNS", async () => {
    await useCase.execute(submitData);

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: submitData.question.content,
        userId: submitData.question.userId,
        status: "PENDING",
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    );

    expect(mockPublish).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        question: expect.objectContaining({
          content: submitData.question.content,
          timestamp: expect.any(Number),
          status: "PENDING",
        }),
        provider: submitData.provider,
      }),
    );
  });
});
