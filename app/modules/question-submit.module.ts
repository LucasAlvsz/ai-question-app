import { DynamoQuestionRepository } from "@/repositories/question-repository/dynamo-question.repository";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";
import { SubmitQuestionUseCase } from "@/use-cases/submit-question.usecase";

const questionRepository = new DynamoQuestionRepository();
const snsService = new SnsService();
const questionService = new QuestionService(questionRepository, snsService);

export const submitQuestionUseCase = new SubmitQuestionUseCase(questionService);
