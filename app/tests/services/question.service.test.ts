import { Question } from "@/entities/question";
import { QuestionRepository } from "@/repositories/question-repository/question.repository";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";

describe("QuestionService", () => {
  const mockSave = jest.fn();
  const mockUpdate = jest.fn();
  const mockPublish = jest.fn();

  const mockRepo: QuestionRepository = {
    save: mockSave,
    update: mockUpdate,
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

  it("should call questionRepo.update on updateQuestionWithAnswer", async () => {
    const updatedQuestion = {
      id: sampleQuestion.id,
      timestamp: sampleQuestion.timestamp,
      answer: "Brasília",
      status: "ANSWERED" as const,
    };
    await service.updateQuestionWithAnswer(updatedQuestion);
    expect(mockUpdate).toHaveBeenCalledWith({
      id: updatedQuestion.id,
      answer: updatedQuestion.answer,
      status: updatedQuestion.status,
      timestamp: updatedQuestion.timestamp,
    });
  });

  it("should call snsService.publish on AnswerReady", async () => {
    process.env.SNS_TOPIC_ARN = "fake-topic";

    await service.notifyQuestionCreated(sampleQuestion, AIProviderType.HUGGINGFACE);

    expect(mockPublish).toHaveBeenCalledWith("fake-topic", {
      question: {
        id: sampleQuestion.id,
        content: sampleQuestion.content,
        timestamp: sampleQuestion.timestamp,
        status: sampleQuestion.status,
        userId: sampleQuestion.userId,
      },
      provider: AIProviderType.HUGGINGFACE,
    });
  });

  it("should call snsService.publish on QuestionCreated", async () => {
    process.env.SNS_TOPIC_ARN = "fake-topic";

    await service.notifyQuestionAnswered({
      ...sampleQuestion,
      answer: "Brasília",
    });

    expect(mockPublish).toHaveBeenCalledWith("fake-topic", {
      question: {
        id: sampleQuestion.id,
        content: sampleQuestion.content,
        answer: "Brasília",
        timestamp: sampleQuestion.timestamp,
        status: sampleQuestion.status,
        userId: sampleQuestion.userId,
      },
    });
  });
});
