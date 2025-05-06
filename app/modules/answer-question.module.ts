import { DynamoQuestionRepository } from "@/repositories/question-repository/dynamo-question.repository";
import { AIService } from "@/services/ai-services/ai.service";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";
import { AnswerQuestionUseCase } from "@/use-cases/answer-question.usecase";

const aiService = new AIService();
const snsService = new SnsService();
const questionRepository = new DynamoQuestionRepository();
const questionService = new QuestionService(questionRepository, snsService);

export const answerQuestionUseCase = new AnswerQuestionUseCase(aiService, questionService);
