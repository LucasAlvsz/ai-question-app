import { QuestionRepository } from "@/repositories/question/question.repository";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";
import { SubmitQuestionUseCase } from "@/use-cases/submit-question.usecase";
import { SubmitQuestion } from "@/validations/submit-question.schema";

describe("SubmitQuestionUseCase", () => {
  const mockSave = jest.fn();
  const mockPublish = jest.fn();

  const mockRepo: QuestionRepository = {
    save: mockSave,
  };

  const mockSnsService = {
    publish: mockPublish,
  } as unknown as SnsService;

  const questionService = new QuestionService(mockRepo, mockSnsService);
  const useCase = new SubmitQuestionUseCase(questionService);

  const submitData: SubmitQuestion = {
    content: "fake question",
    userId: "a3f23e29-8dcf-4b51-8b6f-df147911b21e",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a question and notify SNS", async () => {
    await useCase.execute(submitData);

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: submitData.content,
        userId: submitData.userId,
        status: "PENDING",
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    );

    expect(mockPublish).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        question: expect.objectContaining({
          content: submitData.content,
        }),
        timestamp: expect.any(Number),
      }),
    );
  });
});
