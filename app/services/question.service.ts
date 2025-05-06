import { AIProviderType } from "./ai-services/ai-provider-type";
import { SnsService } from "./sns.service";
import { Question } from "@/entities/question";
import { QuestionRepository } from "@/repositories/question-repository/question.repository";

export class QuestionService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly snsService: SnsService,
  ) {}
  async createQuestion(question: Question) {
    await this.questionRepo.save(question);
  }

  async updateQuestionWithAnswer(
    question: Pick<Question, "id" | "answer" | "status" | "timestamp">,
  ) {
    await this.questionRepo.update(question);
  }

  async notifyQuestionCreated(question: Question, providerType: AIProviderType) {
    await this.snsService.publish(process.env.SNS_TOPIC_ARN || "", {
      question: {
        id: question.id,
        content: question.content,
        timestamp: question.timestamp,
        status: question.status,
        userId: question.userId,
      },
      provider: providerType,
    });
  }

  async notifyQuestionAnswered(question: Question & { answer: string }) {
    await this.snsService.publish(process.env.SNS_TOPIC_ARN || "", {
      question: {
        id: question.id,
        content: question.content,
        answer: question.answer,
        timestamp: question.timestamp,
        status: question.status,
        userId: question.userId,
      },
    });
  }
}
