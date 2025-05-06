import { AIService } from "@/services/ai-services/ai.service";
import { QuestionService } from "@/services/question.service";
import { PendingQuestionData } from "@/validations/pending-question.schema";

export class AnswerQuestionUseCase {
  constructor(
    private readonly aiService: AIService,
    private readonly questionService: QuestionService,
  ) {}

  async execute(pendingQuestionData: PendingQuestionData): Promise<void> {
    const answer = await this.aiService.generateAnswer(
      pendingQuestionData.question.content,
      pendingQuestionData.provider,
    );

    const updatedQuestion = {
      ...pendingQuestionData.question,
      answer,
      status: "ANSWERED" as const,
      timestamp: pendingQuestionData.question.timestamp,
    };
    await this.questionService.updateQuestionWithAnswer({
      id: updatedQuestion.id,
      answer: updatedQuestion.answer,
      status: updatedQuestion.status,
      timestamp: updatedQuestion.timestamp,
    });
    await this.questionService.notifyQuestionAnswered(updatedQuestion);
  }
}
