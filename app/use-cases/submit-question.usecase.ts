import { v4 as uuidv4 } from "uuid";

import { Question } from "@/entities/question";
import { QuestionService } from "@/services/question.service";
import { SubmitQuestion } from "@/validations/submit-question.schema";

export class SubmitQuestionUseCase {
  constructor(private readonly questionService: QuestionService) {}

  async execute(input: SubmitQuestion): Promise<void> {
    const question: Question = {
      id: uuidv4(),
      content: input.content,
      userId: input.userId,
      status: "PENDING",
      timestamp: Date.now(),
    };

    await this.questionService.createQuestion(question);
    await this.questionService.notifyQuestionCreated(question);
  }
}
