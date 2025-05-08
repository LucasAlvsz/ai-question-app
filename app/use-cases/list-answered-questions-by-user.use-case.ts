import { QuestionService } from "@/services/question.service";

export class ListAnsweredQuestionsByUserUseCase {
  constructor(private readonly questionService: QuestionService) {}

  async execute(userId: string) {
    return await this.questionService.getAnsweredQuestionsByUserId(userId);
  }
}
