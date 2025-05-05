import { Question } from "@/entities/question";
import { QuestionRepository } from "@/repositories/question/question.repository";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";

describe("QuestionService", () => {
  const mockSave = jest.fn();
  const mockPublish = jest.fn();

  const mockRepo: QuestionRepository = {
    save: mockSave,
  };

  const mockSnsService: SnsService = {
    publish: mockPublish,
  } as unknown as SnsService;

  const service = new QuestionService(mockRepo, mockSnsService);

  const sampleQuestion: Question = {
    id: "question-id-123",
    content: "Qual a capital do Brasil?",
    status: "PENDING",
    timestamp: Date.now(),
    userId: "user-id-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call questionRepo.save on createQuestion", async () => {
    await service.createQuestion(sampleQuestion);
    expect(mockSave).toHaveBeenCalledWith(sampleQuestion);
  });

  it("should call snsService.publish on notifyQuestionCreated", async () => {
    process.env.SNS_TOPIC_ARN = "fake-topic";

    await service.notifyQuestionCreated(sampleQuestion);

    expect(mockPublish).toHaveBeenCalledWith("fake-topic", {
      question: {
        id: sampleQuestion.id,
        content: sampleQuestion.content,
      },
      timestamp: sampleQuestion.timestamp,
    });
  });
});
