import { DynamoQuestionRepository } from "@/repositories/question-repository/dynamo-question.repository";
import { QuestionService } from "@/services/question.service";
import { SnsService } from "@/services/sns.service";
import { ListAnsweredQuestionsByUserUseCase } from "@/use-cases/list-answered-questions-by-user.use-case";
import { SubmitQuestionUseCase } from "@/use-cases/submit-question.usecase";

const questionRepository = new DynamoQuestionRepository();
const snsService = new SnsService();
const questionService = new QuestionService(questionRepository, snsService);

const listAnsweredQuestionsUseCase = new ListAnsweredQuestionsByUserUseCase(questionService);
const submitQuestionUseCase = new SubmitQuestionUseCase(questionService);

export { listAnsweredQuestionsUseCase, submitQuestionUseCase };
