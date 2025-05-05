import { SnsService } from "./sns.service";
import { Question } from "@/entities/question";
import { QuestionRepository } from "@/repositories/question/question.repository";

export class QuestionService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly snsService: SnsService,
  ) {}
  async createQuestion(question: Question) {
    await this.questionRepo.save(question);
  }

  async notifyQuestionCreated(question: Question) {
    await this.snsService.publish(process.env.SNS_TOPIC_ARN || "", {
      question: {
        id: question.id,
        content: question.content,
      },
      timestamp: question.timestamp,
    });
  }
}
